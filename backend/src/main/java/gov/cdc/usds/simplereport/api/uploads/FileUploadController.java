package gov.cdc.usds.simplereport.api.uploads;

import static gov.cdc.usds.simplereport.api.Translators.parseUUID;
import static gov.cdc.usds.simplereport.config.WebConfiguration.PATIENT_UPLOAD;
import static gov.cdc.usds.simplereport.config.WebConfiguration.RESULT_UPLOAD;

import gov.cdc.usds.simplereport.api.model.errors.BadRequestException;
import gov.cdc.usds.simplereport.api.model.errors.BulkUploadDisabledException;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.service.PatientBulkUploadService;
import gov.cdc.usds.simplereport.service.TestResultUploadService;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
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
  private final PatientBulkUploadService patientBulkUploadService;
  private final TestResultUploadService testResultUploadService;
  private final FeatureFlagsConfig featureFlagsConfig;

  @PostMapping(PATIENT_UPLOAD)
  public PatientBulkUploadResponse handlePatientsUpload(
      @RequestParam("file") MultipartFile file, @RequestParam String rawFacilityId) {
    assertCsvFileType(file);

    try (InputStream people = file.getInputStream()) {
      return patientBulkUploadService.processPersonCSV(people, parseUUID(rawFacilityId));
    } catch (IllegalGraphqlArgumentException e) {
      log.error("Invalid facility id passed", e);
      throw new BadRequestException("Invalid facility id");
    } catch (IllegalArgumentException e) {
      CsvProcessingException exceptionWithoutPii =
          new CsvProcessingException(
              "Unable to complete patient CSV upload due to an invalid input.");
      exceptionWithoutPii.setStackTrace(e.getStackTrace());
      log.error("Patient CSV upload failed on an IllegalArgumentException", exceptionWithoutPii);
      throw exceptionWithoutPii;
    } catch (IOException e) {
      CsvProcessingException exceptionWithoutPii =
          new CsvProcessingException("Unable to complete patient CSV upload");
      exceptionWithoutPii.setStackTrace(e.getStackTrace());
      log.error("Patient CSV upload failed", exceptionWithoutPii);
      throw exceptionWithoutPii;
    }
  }

  @PostMapping(RESULT_UPLOAD)
  @SuppressWarnings({"checkstyle:illegalcatch"})
  public List<TestResultUpload> handleResultsUpload(@RequestParam("file") MultipartFile file) {
    if (featureFlagsConfig.isBulkUploadDisabled()) {
      throw new BulkUploadDisabledException("Bulk upload feature is temporarily disabled.");
    }

    assertCsvFileType(file);

    try (InputStream resultsUpload = file.getInputStream()) {
      return testResultUploadService.processResultCSV(resultsUpload);
      // catching every exception here ensures that the user will see an error toast for any bulk
      // upload exception. Removing this could result in silent bulk upload failures.
    } catch (Exception e) {
      CsvProcessingException exceptionWithoutPii =
          new CsvProcessingException("Unable to process test result CSV upload");
      exceptionWithoutPii.setStackTrace(e.getStackTrace());
      log.error("Test result CSV encountered an unexpected error", e);
      throw exceptionWithoutPii;
    }
  }

  private static void assertCsvFileType(MultipartFile file) {
    if (!TEXT_CSV_CONTENT_TYPE.equals(file.getContentType())) {
      throw new CsvProcessingException("Only CSV files are supported");
    }
  }
}
