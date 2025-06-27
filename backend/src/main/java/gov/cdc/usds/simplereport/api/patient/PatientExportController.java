package gov.cdc.usds.simplereport.api.patient;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.service.CsvExportService;
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
  private final CsvExportService csvExportService;

  @AuthorizationConfiguration.RequirePermissionCreatePatientAtFacility
  @GetMapping(value = "/patients/download/facility")
  public ResponseEntity<StreamingResponseBody> downloadFacilityPatientsAsCSV(
      @RequestParam() UUID facilityId) {

    log.info("Facility patients CSV download request for facilityId={}", facilityId);

    String timestamp = new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date());
    String zippedCsvFileName = String.format("facility-patients-%s.zip", timestamp);
    String unZippedCsvFileName = String.format("facility-patients-%s.csv", timestamp);

    StreamingResponseBody responseBody =
        outputStream -> {
          csvExportService.streamFacilityPatientsAsZippedCsv(
              outputStream, facilityId, unZippedCsvFileName);
        };

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + zippedCsvFileName)
        .header(HttpHeaders.CONTENT_TYPE, "application/zip")
        .body(responseBody);
  }

  @AuthorizationConfiguration.RequirePermissionToAccessOrg
  @GetMapping(value = "/patients/download/organization")
  public ResponseEntity<StreamingResponseBody> downloadOrganizationPatientsAsCSV(
      @RequestParam() UUID orgId) {

    log.info("Organization patients CSV download request for organizationId={}", orgId);

    String timestamp = new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date());
    String zippedCsvFileName = String.format("organization-patients-%s.zip", timestamp);
    String unZippedCsvFileName = String.format("organization-patients-%s.csv", timestamp);

    StreamingResponseBody responseBody =
        outputStream -> {
          csvExportService.streamOrganizationPatientsAsZippedCsv(
              outputStream, orgId, unZippedCsvFileName);
        };

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + zippedCsvFileName)
        .header(HttpHeaders.CONTENT_TYPE, "application/zip")
        .body(responseBody);
  }
}
