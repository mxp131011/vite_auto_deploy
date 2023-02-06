<?php

/** 允许上传的文件类型 (这些都是zip的类型，主要要使用'application/zip'类型) */
$upFileWhiteList = ['application/zip', 'application/x-zip-compressed', 'application/x-zip', 'application/octet-stream', 'application/x-compressed'];

/** 允许上传的项目名称和与之对应的部署路径 (支持绝对路径和相对路径) */
$upProjectSavePathObj = [
    'project1' => './auto_deploy1', // 相对路径
    'project2' => dirname(__FILE__) . '/auto_deploy2', // 绝对路径
    't9erppc3' => "C:/wwwroot/auto_deploy3" // 绝对路径
];

/** 允许上传的mac地址 */
$upMacWhiteList = ['d0:d0:d0:d0:d0:d0', 'd0:d0:d0:d0:d0:d1'];

// 得到传入的项目名
$projectName = getParameter('projectName');
// 得到传入的mac
$mac = getParameter('mac');

// 注意如果不传文件则其他参数有可能获取不到值
if (!isset($_FILES["file"])) {
    die(echoJson(-1, '部署失败，未获取到上传文件'));
} else if (!$mac) { // 不需要验证mac请注释掉
    die(echoJson(-2, '部署失败，未获取到MAC地址'));
} elseif (!in_array($mac, $upMacWhiteList, true)) { // 不需要验证mac请注释掉
    die(echoJson(-3, '部署失败，请联系管理员授权此设备MAC(' . $mac . ')'));
} elseif (!$projectName) {
    die(echoJson(-4, '部署失败，未获取到项目名称'));
} elseif (!array_key_exists($projectName, $upProjectSavePathObj)) {
    die(echoJson(-5, '部署失败，暂不支持部署此项目，请联系管理员添加'));
} else {
    $folder_path = $upProjectSavePathObj[$projectName]; // 得到保存的相对路径
    $file = $_FILES["file"]; // 获取文件
    if ($file["error"] > 0) {
        die(echoJson(-6, '部署失败，未获取到获取压缩文件'));
    } elseif (!in_array($file["type"], $upFileWhiteList)) {
        die(echoJson(-7, '部署失败，不允许此类型文件上传'));
    } else {
        $tmp_file_path = $file["tmp_name"];
        if (del_dir($folder_path)) {
            unzip_file($tmp_file_path, $folder_path);
            echo echoJson(1, '部署成功');
        } else {
            echo echoJson(-8, '部署失败，删除原文件失败');
        }
    }
}


/**
 * 解压文件
 */
function unzip_file($file, $destination) {
    // 实例化对象
    $zip = new ZipArchive();
    //打开zip文档，如果打开失败返回提示信息
    if ($zip->open($file) === true) {
        $zip->extractTo($destination); // 解压到指定目录
        //关闭zip文档
        $zip->close();
        return true;
    } else {
        die(echoJson(-9, '部署失败，解压源文件失败'));
    }
}

/**
 * 删除指定文件夹以及文件夹下的所有文件
 * @param string $dir 要删除的路径 相对路径如：'../../aaa'
 * @return Boolean
 */
function del_dir($dir) {
    // 判断是否为目录
    if (is_dir($dir)) { // 判断是否存在
        $handle = opendir($dir); // 打开目录

        while (($file = readdir($handle)) !== false) {
            // 排除当前目录与父级目录
            if ($file !== "." && $file !== "..") {
                //如果是文件夹就递归调用，不是文件夹就删除文件
                is_dir("$dir/$file") ? del_dir("$dir/$file") : unlink("$dir/$file");
            }
        }
        // 读取失败时
        if (readdir($handle) === false) {
            closedir($handle); // 关闭目录
            rmdir($dir); // 删除文件夹
        }
    }
    return true;
}

/**
 * 得到参数
 * @param string $parameter 参数名
 */
function getParameter($parameter) {

    if (isset($_REQUEST[$parameter]) && $_REQUEST[$parameter] != 'null' && $_REQUEST[$parameter] != "undefined") {
        if ($_REQUEST[$parameter] == "false") {
            return false;
        } else if ($_REQUEST[$parameter] == "true") {
            return true;
        } else {
            return $_REQUEST[$parameter];
        }
    } else {
        return null;
    }
}

/**
 * 返回需要输出的带状态值的Json字符串
 * @param int $code 状态码：0失败，1成功
 * @param bool|int|float|string|array $msg 需要返回的数据
 * @return string
 */
function echoJson($code, $msg) {
    if (is_string($msg)) {
        $arr = array("code" => $code, "msg" => "$msg");
    } else {
        $arr = array("code" => $code, "msg" => $msg);
    }
    return json_encode($arr, JSON_UNESCAPED_UNICODE);
}
