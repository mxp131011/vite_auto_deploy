package com.example.demo.utlis;


import net.lingala.zip4j.core.ZipFile;
import net.lingala.zip4j.exception.ZipException;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;

public class FileUtils {


    /**
     * 删除文件夹以及它下面的所有文件
     * @param destPath 要删除的文件夹路径
     * @throws MyException
     */
    public static void deleteDirectory(String destPath) throws MyException {
        Path path = Paths.get(destPath);
        try {
            Files.walkFileTree(path,
                    new SimpleFileVisitor<>() {
                        // 先去遍历删除文件
                        @Override
                        public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                            Files.delete(file);
                            return FileVisitResult.CONTINUE;
                        }

                        // 再去遍历删除目录
                        @Override
                        public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                            Files.delete(dir);
                            return FileVisitResult.CONTINUE;
                        }
                    }
            );
        } catch (IOException e) {
            throw new MyException(-1, "删除文件四百，-SC001");
        }

    }

    /**
     * 解压并保存成功
     *
     * @param multipartFile 需要解压的文件
     * @param destPath      保存的文件路径
     */
    public static void zipUncompress(MultipartFile multipartFile, String destPath) throws MyException {
        if (!destPath.endsWith(File.separator)) {
            destPath = destPath + File.separator;
        }
        File file = new File(destPath + multipartFile.getOriginalFilename());
        boolean tag = false;
        if (!file.exists() && !file.isDirectory()) {
            tag = file.mkdirs();
        }
        if (tag) {
            try {
                multipartFile.transferTo(file);
                ZipFile zip = new ZipFile(file);
                /*zip4j默认用GBK编码去解压,这里设置编码为GBK的*/
                zip.setFileNameCharset("GBK");
                zip.extractAll(destPath);
                file.delete();
            } catch (IOException | ZipException e) {
                throw new MyException(-1, "解压文件失败，-JY001");
            }
        }

    }
}

