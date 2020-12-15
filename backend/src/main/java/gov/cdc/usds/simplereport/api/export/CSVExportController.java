package gov.cdc.usds.simplereport.api.export;

import gov.cdc.usds.simplereport.service.ExportService;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

import javax.servlet.http.HttpServletResponse;


/**
 * Created by nickrobison on 11/21/20
 */
@RestController
@RequestMapping(value = "/export")
@Validated
public class CSVExportController {

    private final ExportService _es;

    public CSVExportController(ExportService es) {
        this._es = es;
    }

    @GetMapping(value = "/testEvent", produces = {"text/csv"})
    public ResponseEntity<?> exportTestEventCSV(HttpServletResponse response) throws IOException {
      response.setContentType("text/csv");
      DateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss");
      String currentDateTime = dateFormatter.format(new Date());
       
      String headerKey = "Content-Disposition";
      String headerValue = "attachment; filename=testEvents_" + currentDateTime + ".csv";
      response.setHeader(headerKey, headerValue);
      response.getWriter().print(_es.CreateTestEventCSV("2020-01-01T0:00:00.00Z"));
      return ResponseEntity.accepted().build();
    }
}

