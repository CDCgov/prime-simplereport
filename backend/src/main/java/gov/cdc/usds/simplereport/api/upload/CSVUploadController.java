package gov.cdc.usds.simplereport.api.upload;

import gov.cdc.usds.simplereport.service.UploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.InputStream;

/**
 * Created by nickrobison on 11/21/20
 */
@RestController
@RequestMapping(value = "/upload")
@Validated
public class CSVUploadController {

    private final UploadService _us;

    public CSVUploadController(UploadService us) {
        this._us = us;
    }

    @PostMapping(value = "/person", consumes = {"text/csv"})
    public ResponseEntity<?> uploadPersonCSV(InputStream csvStream) throws IOException {
        _us.processPersonCSV(csvStream);
        return ResponseEntity.accepted().build();
    }
}
