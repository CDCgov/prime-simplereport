package gov.cdc.usds.simplereport.api.patient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.UploadService;
import graphql.ErrorType;
import graphql.GraphQLError;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import javax.servlet.http.Part;
import org.assertj.core.api.InstanceOfAssertFactories;
import org.junit.jupiter.api.Test;

class PatientMutationResolverTest {

  @Test
  @SuppressWarnings("checkstyle:IllegalCatch")
  void uploadPatients_uploadExceptionThrown_graphQlErrorCaught() throws IOException {
    var personService = mock(PersonService.class);
    var uploadService = mock(UploadService.class);
    var input = mock(Part.class);
    when(input.getInputStream()).thenThrow(new IOException("Some TCP error, probably."));

    var sut = new PatientMutationResolver(personService, uploadService);
    Throwable caught = assertThrows(Throwable.class, () -> sut.uploadPatients(input));
    assertThat(caught)
        .asInstanceOf(InstanceOfAssertFactories.type(GraphQLError.class))
        .matches(e -> e.getErrorType() == ErrorType.ExecutionAborted);
  }

  @Test
  void uploadPatients_validationExceptionThrown_sameExceptionCaught() throws IOException {
    var personService = mock(PersonService.class);
    var uploadService = mock(UploadService.class);
    when(uploadService.processPersonCSV(any(InputStream.class)))
        .thenThrow(new IllegalGraphqlArgumentException("PANIC"));

    var input = mock(Part.class);
    when(input.getInputStream()).thenReturn(new ByteArrayInputStream(new byte[0]));

    var sut = new PatientMutationResolver(personService, uploadService);

    Exception caught =
        assertThrows(IllegalGraphqlArgumentException.class, () -> sut.uploadPatients(input));
    assertThat(caught).hasMessage("PANIC");
  }
}
