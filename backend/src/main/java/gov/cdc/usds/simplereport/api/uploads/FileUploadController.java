package gov.cdc.usds.simplereport.api.uploads;

import static gov.cdc.usds.simplereport.api.Translators.parseUUID;
import static gov.cdc.usds.simplereport.config.WebConfiguration.PATIENT_UPLOAD;
import static gov.cdc.usds.simplereport.config.WebConfiguration.RESULT_UPLOAD;

import gov.cdc.usds.simplereport.api.model.errors.BadRequestException;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.service.TestResultUploadService;
import gov.cdc.usds.simplereport.service.UploadService;
import java.io.IOException;
import java.io.InputStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {
  public static final String TEXT_CSV_CONTENT_TYPE = "text/csv";
  private final UploadService uploadService;
  private final TestResultUploadService testResultUploadService;

  @PostMapping(PATIENT_UPLOAD)
  public String handlePatientsUpload(
      @RequestParam("file") MultipartFile file, @RequestParam String rawFacilityId) {
    assertCsvFileType(file);

    try (InputStream people = file.getInputStream()) {
      return uploadService.processPersonCSV(people, parseUUID(rawFacilityId));
    } catch (IllegalGraphqlArgumentException e) {
      log.error("Invalid facility id passed", e);
      throw new BadRequestException("Invalid facility id");
    } catch (IllegalArgumentException e) {
      log.error("Patient CSV upload failed", e);
      throw new CsvProcessingException(e.getMessage());
    } catch (IOException e) {
      log.error("Patient CSV upload failed", e);
      throw new CsvProcessingException("Unable to complete patient CSV upload");
    }
  }

  @PostMapping(RESULT_UPLOAD)
  public TestResultUpload handleResultsUpload(@RequestParam("file") MultipartFile file) {
    assertCsvFileType(file);

    try (InputStream resultsUpload = file.getInputStream()) {
      return testResultUploadService.processResultCSV(resultsUpload);
    } catch (IOException e) {
      log.error("Test result CSV encountered an unexpected error", e);
      throw new CsvProcessingException("Unable to process test result CSV upload");
    }
  }

  private static void assertCsvFileType(MultipartFile file) {
    if (!TEXT_CSV_CONTENT_TYPE.equals(file.getContentType())) {
      throw new CsvProcessingException("Only CSV files are supported");
    }
  }
}
