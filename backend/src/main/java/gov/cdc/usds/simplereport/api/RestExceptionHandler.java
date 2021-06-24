package gov.cdc.usds.simplereport.api;

import com.smartystreets.api.exceptions.BadRequestException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;

@ControllerAdvice
public class RestExceptionHandler {
    
    @ExceptionHandler(OktaAuthenticationFailureException.class)
    public ResponseEntity<String> handleException(OktaAuthenticationFailureException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(e.getMessage());
    }

    @ExceptionHandler(BadRequestException.class) 
    public ResponseEntity<String> handleException(BadRequestException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(e.getMessage());
    }
}