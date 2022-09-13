package gov.cdc.usds.simplereport.api.testresult;

import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.service.TestEventReportingService;
import gov.cdc.usds.simplereport.service.TestResultUploadService;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.MultipartFile;

@Controller
@RequiredArgsConstructor
@Slf4j
public class TestResultMutationResolver {
  private final TestEventRepository testEventRepository;
  private final TestEventReportingService testEventReportingService;
  private final TestResultUploadService testResultUploadService;

  @MutationMapping
  public boolean resendToReportStream(@Argument List<UUID> testEventIds) {
    testEventRepository
        .findAllByInternalIdIn(testEventIds)
        .forEach(testEventReportingService::report);
    return true;
  }

  @MutationMapping
  public TestResultUpload uploadTestResultCSV(@Argument MultipartFile testResultList) {
    try (InputStream resultsUpload = testResultList.getInputStream()) {

      return testResultUploadService.processResultCSV(resultsUpload);
    } catch (IllegalGraphqlArgumentException e) {
      log.error("Error Processing Test Result CSV Upload.", e);
      throw e;
    } catch (IOException e) {
      log.error("Test result CSV encountered an unexpected error", e);
      throw new CsvProcessingException("Unable to process test result CSV upload");
    }
  }
}
