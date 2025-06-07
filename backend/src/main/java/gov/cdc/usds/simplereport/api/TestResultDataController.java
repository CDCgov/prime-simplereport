package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.service.CsvExportService;
import gov.cdc.usds.simplereport.service.DiseaseService;
import gov.cdc.usds.simplereport.service.TestOrderService;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@Slf4j
@RequiredArgsConstructor
public class TestResultDataController {
  private final DiseaseService diseaseService;
  private final CsvExportService csvExportService;

  @GetMapping(value = "/results/download")
  public ResponseEntity<StreamingResponseBody> downloadResultsAsCSV(
      @RequestParam(required = false) UUID facilityId,
      @RequestParam(required = false) UUID organizationId,
      @RequestParam(required = false) UUID patientId,
      @RequestParam(required = false) String result,
      @RequestParam(required = false) String role,
      @RequestParam(required = false) String disease,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate,
      @RequestParam(defaultValue = "0") int pageNumber,
      @RequestParam(defaultValue = "5000") int pageSize) {

    log.info(
        "CSV download request for facilityId={}, organizationId={}", facilityId, organizationId);

    if (pageNumber < 0) {
      pageNumber = TestOrderService.DEFAULT_PAGINATION_PAGEOFFSET;
    }
    if (pageSize < 1) {
      pageSize = TestOrderService.DEFAULT_PAGINATION_PAGESIZE;
    }

    SupportedDisease supportedDisease =
        disease != null ? diseaseService.getDiseaseByName(disease) : null;

    final CsvExportService.ExportParameters params =
        new CsvExportService.ExportParameters(
            facilityId,
            organizationId,
            patientId,
            Translators.parseTestResult(result),
            Translators.parsePersonRole(role, true),
            supportedDisease,
            startDate,
            endDate,
            pageNumber,
            pageSize);

    StreamingResponseBody responseBody =
        out -> {
          csvExportService.streamResultsAsZippedCsv(out, params);
        };

    String timestamp = new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date());
    String exportType = facilityId != null ? "facility" : "organization";
    UUID exportId = facilityId != null ? facilityId : organizationId;
    String zipFileName =
        String.format("%s-%s-test-results-%s.zip", exportType, exportId, timestamp);

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + zipFileName)
        .header(HttpHeaders.CONTENT_TYPE, "application/zip")
        .body(responseBody);
  }
}
