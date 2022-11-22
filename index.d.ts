import { Plugin } from 'vite';

export interface optionsType {
    /**
     * 项目名称 用于服务器端权限验证
     *
     * @default installed version
     */
    projectName: string; 

    /**
     * 上传的地址
     *
     * @default installed version
     */
    uploadUrl: string; 

    /**
     * 是否保存本地zip文件,如设置成true，则在dist文件夹中会生成一个.zip压缩包
     *
     * @default false
     */
    saveLocalZip: boolean;
}

declare const viteAutoDeploy: (options: optionsType) => Plugin;

export default viteAutoDeploy;
