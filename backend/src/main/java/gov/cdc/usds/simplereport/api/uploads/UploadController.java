package gov.cdc.usds.simplereport.api.uploads;

import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
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
public class UploadController {
  private final UploadService uploadService;
  private final TestResultUploadService testResultUploadService;

  @PostMapping("upload/patients")
  public String handlePatientsUpload(@RequestParam("file") MultipartFile file) {
    try (InputStream people = file.getInputStream()) {
      return uploadService.processPersonCSV(people);
    } catch (IllegalArgumentException e) {
      log.error("Patient CSV upload failed", e);
      throw new CsvProcessingException(e.toString());
    } catch (IOException e) {
      log.error("Patient CSV upload failed", e);
      throw new CsvProcessingException("Unable to complete patient CSV upload");
    }
  }

  @PostMapping("upload/results")
  public TestResultUpload handleResultsUpload(@RequestParam("file") MultipartFile file) {
    try (InputStream resultsUpload = file.getInputStream()) {

      return testResultUploadService.processResultCSV(resultsUpload);
    } catch (IOException e) {
      log.error("Test result CSV encountered an unexpected error", e);
      throw new CsvProcessingException("Unable to process test result CSV upload");
    }
  }
}
