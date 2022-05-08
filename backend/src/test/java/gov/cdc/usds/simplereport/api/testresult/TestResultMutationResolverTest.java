package gov.cdc.usds.simplereport.api.testresult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.service.TestEventReportingService;
import gov.cdc.usds.simplereport.service.TestResultUploadService;
import graphql.ErrorType;
import graphql.GraphQLError;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import javax.servlet.http.Part;
import org.assertj.core.api.InstanceOfAssertFactories;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
public class TestResultMutationResolverTest {

  @MockBean private TestEventRepository _repo;
  @MockBean private TestEventReportingService _reportingSvc;
  @MockBean private TestResultUploadService _uploadSvc;

  @Test
  void uploadResults_uploadExceptionThrown_graphqlErrorCaught() throws IOException {
    var input = mock(Part.class);
    when(input.getInputStream()).thenThrow(new IOException("some network error"));

    var sut = new TestResultMutationResolver(_repo, _reportingSvc, _uploadSvc);
    Throwable caught = assertThrows(Throwable.class, () -> sut.uploadTestResultCSV(input));

    assertThat(caught)
        .asInstanceOf(InstanceOfAssertFactories.type(GraphQLError.class))
        .matches(e -> e.getErrorType() == ErrorType.ExecutionAborted);
  }

  @Test
  void uploadResults_upload_uploadServiceCalled() throws IOException {
    var input = mock(Part.class);
    when(input.getInputStream()).thenReturn(new ByteArrayInputStream(new byte[0]));

    var sut = new TestResultMutationResolver(_repo, _reportingSvc, _uploadSvc);
    sut.uploadTestResultCSV(input);
    verify(_uploadSvc).processResultCSV(any());
  }
}
