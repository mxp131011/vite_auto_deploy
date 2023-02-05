package com.example.demo.Controller;

import com.example.demo.utlis.MyException;
import com.example.demo.utlis.Result;
import com.example.demo.utlis.FileUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.Arrays;
import java.util.HashMap;

@RestController
public class DemoController {

    /**
     * 存放的绝对路径
     * File.separator 的作用相当于 '\' (在 windows 中文件文件分隔符 用 '\' 或者 '/' 都可以,但是在 Linux 中，是不识别 '\'的，所以用File.separator抹平差异)
     */
    private final String uploadPath = "F:" + File.separator + "aaa" + File.separator + "aaa";

    /**
     * 允许上传的文件类型 (这些都是zip的类型，主要要使用'application/zip'类型)
     */
    private final String[] upFileWhiteList = new String[]{"application/zip", "application/x-zip-compressed", "application/x-zip", "application/octet-stream", "application/x-compressed"};

    /**
     * 允许上传的mac地址
     */
    private final String[] upMacWhiteList = new String[]{"d0:d0:d0:d0:d0:d0", "d0:d0:d0:d0:d0:d1"};


    /**
     * 允许上传的项目名称和与之对应的部署路径 (支持绝对路径和相对路径)
     * File.separator 的作用相当于 '\' (在 windows 中文件文件分隔符 用 '\' 或者 '/' 都可以,但是在 Linux 中，是不识别 '\'的，所以用File.separator抹平差异)
     */
    private final HashMap<String, String> upProjectSavePathMap = new HashMap<String, String>() {
        {
            put("project1", "F:" + File.separator + "aaa" + File.separator + "aaa");
            put("project2", "F:/aaa/aaa");  // 与上面相同
        }
    };


    /**
     * 压缩包文件上传
     *
     * @param file 压缩包文件
     * @return Result 返回实体类
     */
    @PostMapping("/upload")
    public Result upload(@RequestParam(required = false) MultipartFile file, @RequestParam(required = false) String projectName, @RequestParam(required = false) String mac) throws MyException {
        if (mac == null || mac.isEmpty()) { // 不需要验证mac请注释掉
            return Result.error(-1, "部署失败，未获取到MAC地址");
        } else if (!(Arrays.asList(upMacWhiteList).contains(mac))) { // 不需要验证mac请注释掉
            return Result.error(-2, "部署失败，请联系管理员授权此设备MAC(" + mac + ")");
        } else if (projectName == null || projectName.isEmpty()) {
            return Result.error(-3, "部署失败，未获取到项目名称");
        }  else if (!upProjectSavePathMap.containsKey(projectName)) {
            return Result.error(-5, "部署失败，暂不支持部署此项目，请联系管理员添加");
        } else if (file == null) {
            return Result.error(-4, "部署失败，未获取到上传文件");
        } else {
            FileUtils.deleteDirectory(uploadPath); // 删除文件夹
            FileUtils.zipUncompress(file, uploadPath); // 解压文件
            return Result.success(null,"部署成功");
        }
    }
}