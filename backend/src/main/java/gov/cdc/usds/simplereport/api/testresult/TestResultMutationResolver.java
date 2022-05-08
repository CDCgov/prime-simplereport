package gov.cdc.usds.simplereport.api.testresult;

import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.service.TestEventReportingService;
import gov.cdc.usds.simplereport.service.TestResultUploadService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;
import javax.servlet.http.Part;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TestResultMutationResolver implements GraphQLMutationResolver {
  private final TestEventRepository testEventRepository;
  private final TestEventReportingService testEventReportingService;
  private final TestResultUploadService testResultUploadService;

  public boolean resendToReportStream(List<UUID> testEventIds) {
    testEventRepository
        .findAllByInternalIdIn(testEventIds)
        .forEach(testEventReportingService::report);
    return true;
  }

  public String uploadTestResultCSV(Part part) {
    try (InputStream resultsUpload = part.getInputStream()) {
      try {
        return testResultUploadService.processResultCSV(resultsUpload);
      } catch (IllegalGraphqlArgumentException e) {
        throw e;
      }
    } catch (IOException e) {
      log.error("Test result CSV encountered an unexpected error", e);
      throw new CsvProcessingException("Unable to process test result CSV upload");
    }
  }
}
