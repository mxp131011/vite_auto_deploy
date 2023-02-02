import type { Context } from 'koa';
import { join } from 'path';
import { zip } from 'compressing';
import { UPLOAD_FILE_TYPE } from '../config/config';
import { readFile, remove } from 'fs-extra';

/**
 * 上传源代码
 */
export async function uploadSourceCode(ctx: Context) {
  const files = ctx.request.files; // 所有上传的文件
  if (files?.file && !Array.isArray(files.file)) {
    const file = files.file; // key为file的文件
    const mimetype = file.mimetype; // 文件的类型

    /** 判断是否是允许上传的类型 */
    if (mimetype && mimetype in UPLOAD_FILE_TYPE) {
      try {
        const type = UPLOAD_FILE_TYPE[mimetype as keyof typeof UPLOAD_FILE_TYPE];
        if (type === 'zip') {
          const buff = await readFile(file.filepath); // 读取文件为Buffer
          const dest = join(process.cwd(), './upload'); // 需要保存的目录 (可以是绝对路径也可以是相对路径)
          await remove(dest); // 删除目录下的所有东西
          await zip.uncompress(buff, dest);
          ctx.state.success({ code: 1, message: '部署成功' });
        } else {
          ctx.state.fail({ code: -1002, message: '暂不支持解压该文件' });
        }
      } catch (error) {
        ctx.state.fail({ code: -1002, message: '服务器内部错误' });
      }
    } else {
      ctx.state.fail({ code: -1002, message: '暂不支持上传此格式图片' });
    }
  } else {
    ctx.state.fail({ code: -1001, message: '参数错误' });
  }
}
