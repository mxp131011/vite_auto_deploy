import type { Context } from 'koa';
import { join } from 'path';
import { zip } from 'compressing';
import { readFile, remove } from 'fs-extra';

/** 允许上传的文件类型 (这些都是zip的类型，主要要使用'application/zip'类型) */
const upFileWhiteList = ['application/zip', 'application/x-zip-compressed', 'application/x-zip', 'application/octet-stream', 'application/x-compressed'];

/** 允许上传的mac地址 */
const upMacWhiteList = ['d0:d0:d0:d0:d0:d0', 'd0:d0:d0:d0:d0:d1'];

/** 允许上传的项目名称和与之对应的部署路径 (支持绝对路径和相对路径) */
const upProjectSavePathObj = {
  project1: 'F:/ProjectsVSCode/vite_auto_deploy_js/serverCode/nodejs/upload1',
  project2: join(process.cwd(), './upload2'),
  project3: './upload3',
};

/**
 * 上传源代码
 */
export async function uploadSourceCode(ctx: Context) {
  const mac = 'mac' in ctx.request.body ? ctx.request.body.mac : undefined;
  const projectName = 'projectName' in ctx.request.body ? ctx.request.body.projectName : undefined;
  const file = 'files' in ctx.request && 'file' in ctx.request.files! ? ctx.request.files.file : undefined;
  if (!mac) {
    ctx.state.fail({ code: -1001, message: '部署失败，未获取到MAC地址' });
  } else if (!upMacWhiteList.includes(mac)) {
    ctx.state.fail({ code: -1001, message: `部署失败，请联系管理员授权此设备MAC(${mac})` });
  } else if (!projectName) {
    ctx.state.fail({ code: -1001, message: '部署失败，未获取到项目名称' });
  } else if (!(projectName in upProjectSavePathObj)) {
    ctx.state.fail({ code: -1002, message: '部署失败，暂不支持部署此项目，请联系管理员添加' });
  } else if (!file) {
    ctx.state.fail({ code: -1002, message: '部署失败，未获取到获取压缩文件' });
  } else if (Array.isArray(file)) {
    ctx.state.fail({ code: -1002, message: '部署失败，暂不支持多文件上传' });
  } else if (!upFileWhiteList.includes(file.mimetype || '')) {
    ctx.state.fail({ code: -1002, message: '部署失败，暂不支持上传此格式' });
  } else {
    try {
      const buff = await readFile(file.filepath); // 读取文件为Buffer
      const dest = upProjectSavePathObj[projectName as keyof typeof upProjectSavePathObj]; // 需要保存的目录
      await remove(dest); // 删除目录下的所有东西
      await zip.uncompress(buff, dest); // 解压并保存
      ctx.state.success({ code: 1, message: '部署成功' });
    } catch (error) {
      ctx.state.fail({ code: -1003, message: '部署失败，服务器内部错误' });
    }
  }
}
