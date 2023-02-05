# 介绍

用于自动打包并上传打包后的文件到服务器指定目录的项目，此插件需要配合服务器端代码才能实现。(详见:[服务器开发指南](#服务器开发指南)))，具体功能如下：

1. 客户端运行 `vite build`后自动压缩并上传打包好的文件至指定服务器的指定目录中
2. 服务器解压传过来的源代码->删除已存在的指定目录的所有内容->保存解压后的文件到指定目录中
3. 使用 js 编写且源码简单注释详细易于修改，可自行修改与扩展
4. 注意：服务器会验证设备 mac 是否在允许上传的设备白名单内，且服务器必须配置允许上传的`{'项目名':'保存目录'}`的键值对白名单

## 为什么不使用 sftp 等实现自动化部署

1. sftp 上传需要暴露账号密码，本插件配合服务器端就不用暴露账号密码更加安全
2. sftp 不利于控制上传的设备白名单，本插件配合服务器端可实现只允许某几个 mac 地址的设备上传
3. sftp 不能压缩，上传不稳定，速度较慢，本插件是先压缩然后上传压缩包，在由服务器端解压部署，更稳定高效率
4. sftp 需要搭建专门的 sftp 服务

## 安装

```js

npm i vite-auto-deploy
// 或
pnpm i vite-auto-deploy
// 或
yarn add vite-auto-deploy

```

## 使用

```js
//在 vite.config.js文件中添加
import autoDeploy from 'vite-auto-deploy';
import { defineConfig } from 'vite';
export default defineConfig(() => {
  return {
    plugins: [
      autoDeploy({
        projectName: '', // 项目名称 用于服务器端获取保存到哪一个目录下 【也可用于限制那些项目可以上传，只有在允许项目的白名单内才可以上传】
        uploadUrl: '', // 上传地址 如：https://www.xxxxx.com/auto_deploy/main/deploy.php
        saveLocalZip: false, // 是否保存本地zip文件 默认false
      }),
    ],
  };
});
```

## 获取本机 MAC

1. 引入此插件后，打包时如果没有把 mac 加到服务器的白名单时，会在控制台提示出本机 mac
2. 使用[getmac](https://www.npmjs.com/package/getmac)插件获取 【推荐 本插件就是用 getmac 获取的本机 mac】

## 服务器开发指南

- **本插件最终会上传参数给服务器**

```js
// 上传的是一个 FormData 格式的 post 请求
{
  file:aaaa.zip, // 压缩后的zip文件流 (服务器端需要解压吃文件然后部署到指定文件夹下)
  mac:'', // mac地址 (主要用于限制那些mac可以上传)
  projectName:''，// 项目名称 (如果多个项目都是用的同上传地址时，服务端可用此字段区分是哪一个项目)
}
```

- **服务器需要返回的参数**

```js
{
  code:1, // 1代表上传成功，其他代表上传失败
  msg:'上传成功', // 上传成功或失败的提示信息
}
```

服务器端可通过 `file` 获取上传的源代码压缩包， 通过 `mac`（通过[getmac](https://www.npmjs.com/package/getmac)获取） 来限制允许那些设备上传，通过 `projectName`（使用本插件时配置的项目名称）指定这个项目应该部署到哪个目录下， 对于服务器端来说`mac`和`projectName`都不是必须的，也可根据自己的业务来决定是否使用`mac`和`projectName`，可参照本项目`serverCode`目录下的JAVA、NODE或PHP项目代码开发

## 服务器示例代码

1. [php示例](https://gitee.com/mxp_open/vite_auto_deploy/tree/master/serverCode/php)
2. [nodejs示例](https://gitee.com/mxp_open/vite_auto_deploy/tree/master/serverCode/nodejs)
3. [java示例](https://gitee.com/mxp_open/vite_auto_deploy/tree/master/serverCode/java)

## 如需帮助

1. 微信：mxp131011
2. QQ：925809394 【不常用】
3. 邮箱：mxp131011@qq.com
4. 在[issues](https://gitee.com/mxp_open/vite_auto_deploy/issues)中提问
