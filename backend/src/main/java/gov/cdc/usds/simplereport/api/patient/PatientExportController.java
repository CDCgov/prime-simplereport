package gov.cdc.usds.simplereport.api.patient;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration.RequirePermissionReadResultListAtFacility;
import gov.cdc.usds.simplereport.service.FacilityCsvExportService;
import gov.cdc.usds.simplereport.service.TestOrderService;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@Slf4j
@RequiredArgsConstructor
public class PatientExportController {
  private final FacilityCsvExportService csvExportService;

  @RequirePermissionReadResultListAtFacility
  @GetMapping(value = "/patients/download/facility")
  public ResponseEntity<StreamingResponseBody> downloadFacilityPatientsAsCSV(
      @RequestParam() UUID facilityId,
      @RequestParam(defaultValue = "0") int pageNumber,
      @RequestParam(defaultValue = "5000") int pageSize) {

    log.info("Facility patients CSV download request for facilityId={}", facilityId);

    if (pageNumber < 0) {
      pageNumber = TestOrderService.DEFAULT_PAGINATION_PAGEOFFSET;
    }
    if (pageSize < 1) {
      pageSize = TestOrderService.DEFAULT_PAGINATION_PAGESIZE;
    }

    StreamingResponseBody responseBody =
        outputStream -> {
          csvExportService.streamFacilityPatientsAsZippedCsv(outputStream, facilityId);
        };

    String timestamp = new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date());
    String zippedCsvFileName = String.format("facility-%s-patients-%s.zip", facilityId, timestamp);

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + zippedCsvFileName)
        .header(HttpHeaders.CONTENT_TYPE, "text/csv;charset=UTF-8")
        .body(responseBody);
  }

  @RequirePermissionReadResultListAtFacility
  @GetMapping(value = "/patients/download/organization")
  public ResponseEntity<StreamingResponseBody> downloadOrganizationPatientsAsCSV(
      @RequestParam() UUID organizationId,
      @RequestParam(defaultValue = "0") int pageNumber,
      @RequestParam(defaultValue = "5000") int pageSize) {

    log.info("Organization patients CSV download request for organizationId={}", organizationId);

    if (pageNumber < 0) {
      pageNumber = TestOrderService.DEFAULT_PAGINATION_PAGEOFFSET;
    }
    if (pageSize < 1) {
      pageSize = TestOrderService.DEFAULT_PAGINATION_PAGESIZE;
    }

    StreamingResponseBody responseBody =
        outputStream -> {
          csvExportService.streamOrganizationPatientsAsZippedCsv(outputStream, organizationId);
        };

    String timestamp = new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date());
    String zippedCsvFileName =
        String.format("organization-%s-patients-%s.zip", organizationId, timestamp);

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + zippedCsvFileName)
        .header(HttpHeaders.CONTENT_TYPE, "text/csv;charset=UTF-8")
        .body(responseBody);
  }
}
