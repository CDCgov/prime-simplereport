package gov.cdc.usds.simplereport.api.testresult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.github.tomakehurst.wiremock.WireMockServer;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.service.DataHubClient;
import gov.cdc.usds.simplereport.service.TestEventReportingService;
import gov.cdc.usds.simplereport.service.TestResultUploadService;
import gov.cdc.usds.simplereport.test_util.WireMockConfig;
import graphql.ErrorType;
import graphql.GraphQLError;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import javax.servlet.http.Part;
import org.assertj.core.api.InstanceOfAssertFactories;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnableConfigurationProperties
@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = {WireMockConfig.class})
class TestResultMutationResolverTest {

  @MockBean private TestEventRepository _mockRepo;
  @MockBean private TestEventReportingService _mockReportingSvc;
  @MockBean private TestResultUploadService _mockUploadSvc;

  @Autowired private TestResultUploadService testResultUploadService;
  @Autowired private DataHubClient dataHubClient;
  @Autowired private TestResultMutationResolver resolver;
  @Autowired private WireMockServer wireMockServer;

  @Test
  void uploadResults_uploadExceptionThrown_graphqlErrorCaught() throws IOException {
    var input = mock(Part.class);
    when(input.getInputStream()).thenThrow(new IOException("some network error"));

    var sut = new TestResultMutationResolver(_mockRepo, _mockReportingSvc, _mockUploadSvc);
    Throwable caught = assertThrows(Throwable.class, () -> sut.uploadTestResultCSV(input));

    assertThat(caught)
        .asInstanceOf(InstanceOfAssertFactories.type(GraphQLError.class))
        .matches(e -> e.getErrorType() == ErrorType.ExecutionAborted);
  }

  @Test
  void uploadResults_upload_uploadServiceCalled() throws IOException {
    var input = mock(Part.class);
    when(input.getInputStream()).thenReturn(new ByteArrayInputStream(new byte[0]));
    when(_mockUploadSvc.processResultCSV(any()))
        .thenReturn(new TestResultUpload(UploadStatus.SUCCESS));

    var sut = new TestResultMutationResolver(_mockRepo, _mockReportingSvc, _mockUploadSvc);
    sut.uploadTestResultCSV(input);
    verify(_mockUploadSvc).processResultCSV(any());
  }
}
