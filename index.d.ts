
import { Plugin } from 'vite';

export interface optionsType {
    projectName: string, // 项目名称 用于服务器端获取保存到哪一个目录下
    uploadUrl: string, // 上传地址
    saveLocalZip: boolean, // 是否保存本地zip文件
}


declare const viteAutoDeploy: (options:optionsType) => Plugin;

export default viteAutoDeploy;