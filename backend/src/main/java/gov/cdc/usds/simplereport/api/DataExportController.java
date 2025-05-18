package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultsListItem;
import gov.cdc.usds.simplereport.service.DiseaseService;
import gov.cdc.usds.simplereport.service.ResultService;
import gov.cdc.usds.simplereport.service.TestOrderService;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequiredArgsConstructor
public class DataExportController {
  private final ResultService resultService;
  private final DiseaseService diseaseService;

  @GetMapping(value = "/api/results/download", produces = "text/csv")
  public ResponseEntity<Resource> downloadResultsAsCSV(
      @RequestParam(required = false) UUID facilityId,
      @RequestParam(required = false) UUID patientId,
      @RequestParam(required = false) String result,
      @RequestParam(required = false) String role,
      @RequestParam(required = false) String disease,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate,
      @RequestParam(defaultValue = "0") int pageNumber,
      @RequestParam(defaultValue = "20000") int pageSize) {

    log.info("CSV download request received with facilityId={}, pageSize={}", facilityId, pageSize);

    if (pageNumber < 0) {
      pageNumber = TestOrderService.DEFAULT_PAGINATION_PAGEOFFSET;
    }

    if (pageSize < 1) {
      pageSize = TestOrderService.DEFAULT_PAGINATION_PAGESIZE;
    }

    SupportedDisease supportedDisease =
        disease != null ? diseaseService.getDiseaseByName(disease) : null;

    Page<TestResultsListItem> resultsPage;
    if (facilityId == null) {
      resultsPage =
          resultService
              .getOrganizationResults(
                  patientId,
                  Translators.parseTestResult(result),
                  Translators.parsePersonRole(role, true),
                  supportedDisease,
                  startDate,
                  endDate,
                  pageNumber,
                  pageSize)
              .map(TestResultsListItem::new);
    } else {
      resultsPage =
          resultService
              .getFacilityResults(
                  facilityId,
                  patientId,
                  Translators.parseTestResult(result),
                  Translators.parsePersonRole(role, true),
                  supportedDisease,
                  startDate,
                  endDate,
                  pageNumber,
                  pageSize)
              .map(TestResultsListItem::new);
    }

    String csvContent = convertResultsToCSV(resultsPage.getContent());
    ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(csvContent.getBytes());
    InputStreamResource fileInputStream = new InputStreamResource(byteArrayInputStream);

    String timestamp = new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date());
    String csvFileName = "simplereport-test-results-" + timestamp + ".csv";
    HttpHeaders headers = new HttpHeaders();
    headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + csvFileName);
    headers.set(HttpHeaders.CONTENT_TYPE, "text/csv");

    return new ResponseEntity<>(fileInputStream, headers, HttpStatus.OK);
  }

  private String convertResultsToCSV(List<TestResultsListItem> results) {
    StringWriter stringWriter = new StringWriter();
    CSVPrinter csvPrinter = null;

    try {
      csvPrinter =
          new CSVPrinter(
              stringWriter,
              CSVFormat.DEFAULT.withHeader(
                  "Patient ID",
                  "Patient Name",
                  "Facility",
                  "Test Date",
                  "Result",
                  "Test Type",
                  "Disease"));

      for (TestResultsListItem item : results) {
        csvPrinter.printRecord(
            item.getPatient().getInternalId().toString(),
            item.getPatient().getFirstName() + " " + item.getPatient().getLastName(),
            item.getFacility().getFacilityName(),
            new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(item.getDateTested()),
            item.getTestResult(),
            item.getDeviceType().getName(),
            item.getDisease());
      }

      csvPrinter.flush();
      return stringWriter.toString();
    } catch (IOException e) {
      log.error("Error creating CSV file", e);
      return "Error generating CSV";
    } finally {
      if (csvPrinter != null) {
        try {
          csvPrinter.close();
        } catch (IOException e) {
          log.error("Error closing CSV printer", e);
        }
      }
    }
  }
}
