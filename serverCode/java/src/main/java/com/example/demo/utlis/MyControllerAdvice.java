package com.example.demo.utlis;


import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;

@ControllerAdvice
public class MyControllerAdvice {

    @ResponseBody
    @ExceptionHandler(value = Exception.class)
    public Result errorHandler(Exception e) {
        return Result.error(-10001, "系统错误，-10001");
    }
    @ResponseBody
    @ExceptionHandler(value = NullPointerException.class)
    public Result nullPointerHandler(Exception e) {
        return Result.error(-10002, "系统错误，-10002");
    }


    @ResponseBody
    @ExceptionHandler(value = RuntimeException.class)
    public Result runtimeErrorHandler() {
        return Result.error(-10003, "系统错误，-10003");
    }

    @ResponseBody
    @ExceptionHandler(value = MyException.class)
    public Result MyExceptionHandler(MyException e) {
        return Result.error(e.getCode(), e.getMsg());
    }
}