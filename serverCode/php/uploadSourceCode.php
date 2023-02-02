<?php

/**
 * 允许上传的项目白名单 
 *  主要用于限制那些项目可以上传，且方便配置上传后保存到那个路径下：格式如：
 *  array('autoDeploy1' => './auto_deploy', 'autoDeploy' => '../../auto_deploy');
 *  注意此路径是相对与本文件的相对路径，支持通过'../'指向上一级目录
 */
$projectFileNameArr =  array(
    '项目名称1' => '对应储存的相对路径2',
    '项目名称2' => '../../对应储存的相对路径2'
);

/**
 * 支持上传的设备mac白名单 如：array('d0:d0:d0:d0:d0:d0','d0:d0:d0:d0:d0:d1'); 
 * 主要用于限制
 */
$macArr =  array('mac地址1','mac地址1');

 // 得到传入的项目名
$projectName = getParameter('projectName');

// 得到传入的mac
$mac = getParameter('mac'); 

if (!$mac) { // 不需要验证mac请注释掉
    die(echoJson(-1, '上传失败，未获取到MAC地址'));
} elseif (!in_array($mac, $macArr, true)) { // 不需要验证mac请注释掉
    die(echoJson(-2, '上传失败，请联系管理员授权此设备MAC(' . $mac . ')'));
} elseif (!$projectName) {
    die(echoJson(-3, '上传失败，未获取到项目名称'));
} elseif (!isset($_FILES["file"])) {
    die(echoJson(-4, '上传失败，未获取到上传文件'));
} elseif (!$projectName || !array_key_exists($projectName, $projectFileNameArr)) {
    die(echoJson(-5, $mac));
} else {
    $folder_path = $projectFileNameArr[$projectName]; // 得到保存的相对路径
    $file = $_FILES["file"]; // 获取文件
    if ($file["error"] > 0) {
        die(echoJson(-6, '上传失败，获取上传文件失败'));
    } else {
        $filename = $file["name"];
        $tmpname = $file['tmp_name'];
        $filepath = getcwd() . "\\" . $filename; //获取当前目录的绝对路径
        $move = move_uploaded_file($tmpname, $filename);
        if ($move === true) {
            $del = del_dir($folder_path);
            if ($move === true) {
                unzip_file($filename, $folder_path);
                @unlink($filename); //删除源文件
                echo echoJson(1, '上传成功');
            } else {
                echo echoJson(-7, '上传失败，删除原文件失败');
            }
        } else {
            echo echoJson(-8, '上传失败，保存文件失败');
        }
    }
}

/**
 * 解压文件
 */
function unzip_file($file, $destination)
{
    // 实例化对象
    $zip = new ZipArchive();
    //打开zip文档，如果打开失败返回提示信息
    if ($zip->open($file) === true) {
        $zip->extractTo($destination);
        //关闭zip文档
        $zip->close();
        return true;
    } else {
        die(echoJson(-9, '上传失败，解压源文件失败'));
    }
}

/**
 * 删除指定文件夹以及文件夹下的所有文件
 * @param $dir 要删除的路径 相对路径如：'../../aaa'
 * @return Boolean
 */
function del_dir($dir)
{
    if (is_dir($dir)) { // 判断是否存在
        $handle = opendir($dir);
        while (($file = readdir($handle)) !== false) {
            if ($file != "." && $file != "..") {
                is_dir("$dir/$file") ? del_dir("$dir/$file") : unlink("$dir/$file");
            }
        }
        if (readdir($handle) == false) {
            closedir($handle);
            rmdir($dir);
        }
    }
    return true;
}

/**
 * 得到参数
 * @param str $parameter 参数名
 */
function getParameter($parameter)
{
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
 * [返回需要输出的带状态值的Json字符串]
 * @param [string] $code [状态码：0失败，1成功]
 * @param [string] $msg    [需要返回的数据]
 */
function echoJson($code, $msg)
{
    if (is_string($msg)) {
        $arr = array("code" => $code, "msg" => "$msg");
    } else {
        $arr = array("code" => $code, "msg" => $msg);
    }
    return json_encode($arr, JSON_UNESCAPED_UNICODE);
}
