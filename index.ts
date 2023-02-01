import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import FormData from 'form-data';
import { createSpinner } from 'nanospinner';
import getMac from 'getMac';
import type { ResolvedConfig, PluginOption } from 'vite';

type $Config = {
  /** 上传地址 */
  uploadUrl: string;

  /** 项目名称 (如果多个项目都是用的同上传地址时，服务端可用此字段区分是哪一个项目) */
  projectName?: string;

  /** 上传完成后,是否保留压缩包到本地 */
  saveLocalZip?: boolean;
};

type $PostParam = {
  mac: string;
  projectName: string;
};

/**
 * 读取每个文件为buffer并放到存到jszip中
 * @param {JSZip} jszip - JSZip实例
 * @param {string} catalog - 需要压缩的文件目录 如C:\Users\m1310\Desktop\vue-router\dist
 */
function readDir(jszip: JSZip, catalog: string) {
  const files = fs.readdirSync(catalog); // 读取该目录下的所有文件
  files.forEach((fileName) => {
    const fillPath = path.join(catalog, './', fileName);
    const fileState = fs.statSync(fillPath); // 得到文件状态信息
    // 判断是不是文件夹，如果是文件夹的话需要递归遍历下面的子文件
    if (fileState.isDirectory()) {
      const dirZip = jszip.folder(fileName);
      dirZip && readDir(dirZip, fillPath);
    } else {
      // 读取每个文件为buffer存到zip中
      jszip.file(fileName, fs.readFileSync(fillPath));
    }
  });
}

/**
 * 删除已存在的文件
 * @param {string} removePath - 需要删除的完整路径 如:C:\Users\m1310\Desktop\vue-router\dist\dist.zip
 */
function removeExistedZip(removePath: string) {
  if (fs.existsSync(removePath)) {
    // 判断路径是否存在
    fs.unlinkSync(removePath); // 从文件系统中同步删除文件或符号链接。此函数不适用于目录，因此建议使用fs.rmdir()删除目录
  }
}

/**
 * 生成zip文件
 * @param {string} catalog - 需要压缩的文件目录 如C:\Users\m1310\Desktop\vue-router\dist
 */
function zipDir(catalog: string) {
  const jszip = new JSZip();
  readDir(jszip, catalog);
  // 开始创建zip文件
  return jszip.generateAsync({
    type: 'nodebuffer', // 压缩类型
    compression: 'DEFLATE', // 压缩算法
    compressionOptions: {
      level: 6 // 压缩级别
    }
  });
}

/**
 * 上传
 * @param {string} url - 上传的的地址
 * @param {Buffer} buffer - 上传的文件Buffer
 * @param {string} zipName - 文件名称
 * @param { object } postData - 上传携带的额外参数
 */
function uploading(url: string, buffer: Buffer, zipName: string, postData: $PostParam) {
  return new Promise<string>((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', buffer, { filename: zipName });
    // 添加额外的请求参数

    for (const key in postData) {
      formData.append(key, postData[key]);
    }
    formData.submit(url, (err, response) => {
      if (err) {
        reject('上传失败，请检查url是否正确或服务器代码是否有误,-BD001');
      } else {
        response.on('data', (res) => {
          try {
            const result: unknown = JSON.parse(res.toString('utf8'));
            if (result && typeof result === 'object' && !Array.isArray(result) && 'code' in result && 'msg' in result) {
              if (result.code === 1) {
                resolve('部署成功');
              } else {
                reject(typeof result.msg === 'string' ? result.msg : '部署失败');
              }
            } else {
              reject('结果未知，服务器返回内容不是一个有效的json,-BD003');
            }
          } catch (error) {
            reject('结果未知，服务器返回内容不是一个有效的json,-BD004');
          }
        });
        response.on('error', () => {
          reject('上传失败，请检查url是否正确或服务器代码是否有误,-BD002');
        });
      }
    });
  });
}

/**
 * 自动化部署插件
 * @param {object} config - 插件配置
 */
export default function plugin(config: $Config): PluginOption {
  let viteConfig: ResolvedConfig | undefined = undefined; // 最终用户的vite配置
  return {
    name: 'vite-plugin-auto-deploy',
    apply: 'build', // 在什么模式下执行（构建还是开发）
    enforce: 'post', // 插件执行顺序

    /*  在解析 Vite 配置后的回调函数 */
    configResolved(resolvedConfig: ResolvedConfig) {
      viteConfig = resolvedConfig; // 存储最终解析的配置
    },

    /* 在构建完成后的回调 */
    async closeBundle() {
      const uploadUrl = config.uploadUrl || false; // 请求地址
      const projectName = config.projectName || false; // 项目名称
      const spinner = createSpinner();
      spinner.start({ text: '正在压缩并发布到服务器...', color: 'blue' });
      if (!uploadUrl) {
        spinner.error({ text: '发布到服务器失败,请配置uploadUrl', mark: ':(' });
      } else if (!projectName) {
        spinner.error({ text: '发布到服务器失败,请配置projectName', mark: ':(' });
      } else if (!viteConfig) {
        spinner.error({ text: '发布到服务器失败,ResolvedConfig为空', mark: ':(' });
      } else {
        try {
          const outDir = viteConfig.build.outDir; // 得到打包文件存放的目录 （dist）
          const catalog = path.resolve(outDir); // 得到打包文件存放的目录完整目录 （ C:\Users\m1310\Desktop\vue-router\dist）
          const zipName = `${outDir}.zip`; // 得到最终包含后缀的zip文件名
          const storagePath = path.join(catalog, zipName); // 需要存放的路径; // 需要存放zip的路径 （ C:\Users\m1310\Desktop\vue-router\dist\dist.zip）
          removeExistedZip(storagePath); // 删除原来zip(如果有)
          const buf = await zipDir(catalog); // 得到创建的zip文件buffer
          if (config.saveLocalZip) {
            removeExistedZip(storagePath); // 删除原来的zip包
            fs.writeFileSync(storagePath, buf); //  把zip的buffer包写到硬盘中
          }
          const postData: $PostParam = { mac: getMac(), projectName }; // 上传的额外参数
          await uploading(uploadUrl, buf, zipName, postData);
          spinner.success({ text: '发布到服务器成功', mark: ':)' });
        } catch (err) {
          spinner.error({ text: err, mark: ':(' });
        }
      }
    }
  };
}
