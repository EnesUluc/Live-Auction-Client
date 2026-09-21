package com.live.auction_client.domain.exception;

import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(StatusRuntimeException.class)
    public ResponseEntity<Map<String, String>> handleGrpcException(StatusRuntimeException e) {
        Status.Code code = e.getStatus().getCode();

        HttpStatus httpStatus = switch (code){
            case NOT_FOUND -> HttpStatus.NOT_FOUND;
            case INVALID_ARGUMENT -> HttpStatus.BAD_REQUEST;
            case UNAVAILABLE ->  HttpStatus.SERVICE_UNAVAILABLE;
            case ALREADY_EXISTS -> HttpStatus.CONFLICT;
            default ->  HttpStatus.INTERNAL_SERVER_ERROR;
        };

        return ResponseEntity.status(httpStatus).body(Map.of(
                "error", e.getMessage()
        ));
    }
}
