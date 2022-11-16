const path = require('path');
const fs = require('fs');

/**
 * 读取每个文件为buffer并放到存到jszip中
 * @param {*} jszip
 * @param {string} catalog  需要压缩的文件目录 如C:\Users\m1310\Desktop\vue-router\dist
 */
function readDir(jszip, catalog) {
    const files = fs.readdirSync(catalog); // 读取该目录下的所有文件
    files.forEach((fileName) => {
        const fillPath = path.join(catalog, './', fileName);
        const fileState = fs.statSync(fillPath); // 得到文件状态信息
        // 判断是不是文件夹，如果是文件夹的话需要递归遍历下面的子文件
        if (fileState.isDirectory()) {
            const dirZip = jszip.folder(fileName);
            readDir(dirZip, fillPath);
        } else {
            // 读取每个文件为buffer存到zip中
            jszip.file(fileName, fs.readFileSync(fillPath));
        }
    });
}

/**
 * 删除已存在的文件
 *  @param {string} removePath 需要删除的完整路径 如C:\Users\m1310\Desktop\vue-router\dist\dist.zip
 */
function removeExistedZip(removePath) {
    if (fs.existsSync(removePath)) {
        // 判断路径是否存在
        fs.unlinkSync(removePath); // 从文件系统中同步删除文件或符号链接。此函数不适用于目录，因此建议使用fs.rmdir()删除目录
    }
}

/**
 * 生成zip文件
 * @param {string} catalog  需要压缩的文件目录 如C:\Users\m1310\Desktop\vue-router\dist
 */
function zipDir(catalog) {
    const JSZip = require('jszip');
    const jszip = new JSZip();
    readDir(jszip, catalog);
    // 开始创建zip文件
    return jszip.generateAsync({
        type: 'nodebuffer', // 压缩类型
        compression: 'DEFLATE', // 压缩算法
        compressionOptions: {
            level: 6, // 压缩级别
        },
    });
}

/**
 * const
 */
function uploading(url, buffer, zipName, postData = {}) {
    return new Promise((resolve, reject) => {
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('file', buffer, { filename: zipName });
        // 添加额外的请求参数
        if (typeof postData === 'object') {
            for (const key in postData) {
                formData.append(key, postData[key]);
            }
        }
        formData.submit(url, (err, response) => {
            if (err) {
                reject('上传失败，请检查url是否正确或服务器代码是否有误', err);
            } else {
                response.on('data', (res) => {
                    try {
                        const result = JSON.parse(res.toString('utf8'));
                        result.code === 1 ? resolve(result.msg) : reject(result.msg);
                    } catch (error) {
                        reject('结果未知，服务器返回内容不是一个有效的json');
                    }
                });
                response.on('error', (err2) => {
                    reject('上传失败，请检查url是否正确或服务器代码是否有误');
                });
            }
        });
    });
}

/**
 * 自定义的打包发布的插件
 * @param {Object} config
 *  config 配置如下：{
 *      projectName: '', // 项目名称 用于服务器端获取保存到哪一个目录下
        uploadUrl: '', // 上传地址
        aveLocalZip: false, // 是否保存本地zip文件
 * }
 */
function plugin(config = {}) {
    let viteConfig = {}; // 最终用户的vite配置
    return {
        name: 'vite-plugin-auto-deploy',
        apply: 'build', // 在什么模式下执行（构建还是开发）
        enforce: 'post', // 插件执行顺序

        /*  在解析 Vite 配置后的回调函数 */
        configResolved(resolvedConfig) {
            viteConfig = resolvedConfig; // 存储最终解析的配置
        },

        /* 在构建完成后的回调 */
        async closeBundle() {
            const ora = (await import('ora')).default;
            const chalk = (await import('chalk')).default;
            const getMac = (await import('getmac')).default;
            const uploadUrl = config.uploadUrl || false; // 请求地址
            const projectName = config.projectName || false; // 项目名称
            const spinner = ora();
            spinner.start(chalk.blue('正在压缩并发布到服务器...'));
            if (!uploadUrl) {
                spinner.fail(chalk.red.bold('发布到服务器失败,请配置uploadUrl'));
            } else if (!projectName) {
                spinner.fail(chalk.red.bold('发布到服务器失败,请配置projectName'));
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
                    const postData = { mac: getMac(), projectName }; // 上传的额外参数
                    await uploading(uploadUrl, buf, zipName, postData);
                    spinner.succeed(chalk.green.bold('发布到服务器成功'));
                } catch (err) {
                    spinner.fail(chalk.red.bold(err));
                }
            }
        },
    };
}

module.exports = plugin;
