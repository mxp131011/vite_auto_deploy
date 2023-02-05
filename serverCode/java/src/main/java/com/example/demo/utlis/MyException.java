package com.example.demo.utlis;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class MyException extends Exception {
    private int code = -2001;
    private String msg = "系统错误";

    public MyException(int code){
        this.code = code;
    }

    public MyException(String msg){
        this.msg = msg;
    }
}