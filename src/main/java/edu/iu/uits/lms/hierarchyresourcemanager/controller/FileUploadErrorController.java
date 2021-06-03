package edu.iu.uits.lms.hierarchyresourcemanager.controller;

import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.http.fileupload.impl.SizeLimitExceededException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@ControllerAdvice
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class FileUploadErrorController {

    @ExceptionHandler({MaxUploadSizeExceededException.class, SizeLimitExceededException.class})
    public ResponseEntity<String> handleMaxUploadSizeExceededException(Model model, Exception exception) {
        log.warn("Template file upload is larger than the configured value.  May need to increase it if this is legit", exception);
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body("file upload too big");
    }
}
