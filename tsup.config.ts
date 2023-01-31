import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'], // // 入口文件
  format: ['cjs', 'esm'], // 打包类型 ( 如果要生成'esm'类型需注意：package.json的 type设置为"module"或"commonjs" 会决定输出的后缀，详见：https://tsup.egoist.dev/#bundle-formats )
  dts: true, // 生成类型文件 xxx.d.ts
  splitting: true, // 代码分割 默认esm模式支持 如果cjs需要代码分割的话就需要配置为 true
  sourcemap: false, // 是否生成映射的sourcemap文件
  clean: true, // 每次打包先删除dist
  minify: false, // 是否压缩
  treeshake: true, // 是否启用摇树优化
  shims: true // 注入 cjs 和 esm 垫片
});
