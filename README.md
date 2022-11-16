# 介绍

用于自动打包并上传打包后的文件到服务器指定目录的项目，此插件需要配合 [vite_auto_deploy_php](https://gitee.com/mxp_open/vite_auto_deploy_php)php代码才能实现，具体功能如下：

1. 客户端运行 `vite build`后自动压缩并上传打包好的文件至指定服务器的指定目录中
2. 服务器解压传过来的源代码->删除已存在的指定目录的所有内容->保存解压后的文件到指定目录中
3. 使用js编写且源码简单注释详细易于修改，可自行修改与扩展
4. 注意：服务器会验证设备 mac 是否在允许上传的设备白名单内，且服务器必须配置允许上传的`{'项目名':'保存目录'}`的键值对白名单

## 为什么需要使用php而不用sftp

1. sftp上传需要暴露账号密码，配合使用php则无需暴露账号密码
2. sftp不利于控制上传的设备白名单，配合使用php则可以限制设备白名单
3. sftp不能压缩，上传不稳定，速度较慢
4. php代码部署简单，无需专门搭建sftp服务器

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
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
export default defineConfig(() => {
    return {
        plugins: [
            vue(),
            autoDeploy({
                projectName: '', // 项目名称 用于服务器端获取保存到哪一个目录下 【也可用于限制那些项目可以上传，只有在允许项目的白名单内才可以上传】
                uploadUrl: '', // 上传地址 如：https://www.xxxxx.com/auto_deploy/main/deploy.php
                saveLocalZip: false // 是否保存本地zip文件 默认false
            })
        ],
        resolve: {
            alias: {
                '@/': '/src/'
            }
        }
    };
});
```

## 获取本机MAC

1. 引入此插件后，打包时如果没有把mac加到服务器的白名单时，会在控制台提示出本机mac
2. 使用[getmac](https://www.npmjs.com/package/getmac)插件获取 【推荐 本插件就是用getmac获取的本机mac】

## 如需帮助

1. 微信：mxp131011
2. QQ：925809394 【不常用】
3. 邮箱：mxp131011@qq.com
4. 在[issues](https://gitee.com/mxp_open/vite_auto_deploy_js/issues)中提问
