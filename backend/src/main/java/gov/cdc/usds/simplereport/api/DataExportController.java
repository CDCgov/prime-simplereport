package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.service.ResultService;
import java.io.ByteArrayInputStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
// @RequestMapping(value = "/results")
@Slf4j
@RequiredArgsConstructor
public class DataExportController {
  private final ResultService resultService;

  @GetMapping(value = "/download", produces = "text/csv")
  public ResponseEntity<Resource> downloadResultsAsCSV() {

    // Process the result and convert to CSV
    var page = resultService.getOrganizationResults(null, null, null, null, null, null, 0, 1000);

    //        var data = dataExportService.exportData("foo");
    var byteArrayOutputStream = new ByteArrayInputStream(page.toString().getBytes());
    InputStreamResource fileInputStream = new InputStreamResource(byteArrayOutputStream);

    String csvFileName = "export.csv";
    HttpHeaders headers = new HttpHeaders();
    headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + csvFileName);
    headers.set(HttpHeaders.CONTENT_TYPE, "text/csv");

    return new ResponseEntity<>(fileInputStream, headers, HttpStatus.OK);
  }
}
