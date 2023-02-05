package com.example.demo.utlis;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 返回统一数据结构
 *
 * @author purgeyao
 * @since 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result<T> {

    /**
     * 错误码
     */
    private int code;

    /**
     * 错误描述
     */
    private String msg;
    /**
     * 成功数据
     */
    private T data;

    /**
     * 成功
     */
    public static Result success() {
        return new Result(1, "成功", null);
    }

    /**
     * 成功
     */
    public static <T> Result<T> success(T data) {
        return new Result(1, "成功", data);
    }

    /**
     * 成功
     */
    public static <T> Result<T> success(T data, String msg) {
        return new Result(1, msg, data);
    }

    /**
     * 成功
     */
    public static <T> Result<T> success(T data, int code, String msg) {
        return new Result(code, msg, data);
    }

    /**
     * 失败
     */
    public static Result error() {
        return new Result(-1, "失败", null);
    }

    /**
     * 失败
     */
    public static Result error(String msg) {
        return new Result(-1, msg, null);
    }

    /**
     * 失败
     */
    public static Result error(int code, String msg) {
        return new Result(code, msg, null);
    }

    /**
     * 失败
     */
    public static <T> Result<T> error(int code, String msg, T data) {
        return new Result(code, msg, data);
    }


}

