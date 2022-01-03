package gov.cdc.usds.simplereport.api.patient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.UploadService;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import graphql.ErrorType;
import graphql.GraphQLError;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.UUID;
import javax.servlet.http.Part;
import org.assertj.core.api.InstanceOfAssertFactories;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class PatientMutationResolverTest {
  @Autowired private TestDataFactory _dataFactory;

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

  @Test
  void addPatient_canAddWithBackwardsCompatibleTelephone() {
    var personService = mock(PersonService.class);
    var uploadService = mock(UploadService.class);

    var sut = new PatientMutationResolver(personService, uploadService);

    String inputPhoneNumber = _dataFactory.getListOfOnePhoneNumberInput().get(0).getNumber();

    sut.addPatient(
        UUID.randomUUID(),
        "FOO",
        "Fred",
        null,
        "Fosbury",
        "Sr.",
        LocalDate.of(1865, 12, 25),
        "555 Fake St",
        null,
        "Durham",
        "NC",
        "27704",
        inputPhoneNumber,
        null,
        "STAFF",
        null,
        null,
        "USA",
        null,
        null,
        null,
        null,
        null,
        false,
        false,
        "English",
        null);

    verify(personService)
        .addPatient(
            any(UUID.class),
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            argThat((phoneNumbers) -> phoneNumbers.get(0).getNumber().equals(inputPhoneNumber)),
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            any());
  }

  @Test
  void addPatient_canAddWithBackwardsCompatibleEmail() {
    var personService = mock(PersonService.class);
    var uploadService = mock(UploadService.class);

    var sut = new PatientMutationResolver(personService, uploadService);

    sut.addPatient(
        UUID.randomUUID(),
        "FOO",
        "Fred",
        null,
        "Fosbury",
        "Sr.",
        LocalDate.of(1865, 12, 25),
        "555 Fake St",
        null,
        "Durham",
        "NC",
        "27704",
        null,
        null,
        "STAFF",
        "fred.fosbury@foo.com",
        // Simulate an older UI version by not using the multiple email field
        null,
        null,
        "USA",
        null,
        null,
        null,
        null,
        false,
        false,
        "English",
        null);

    verify(personService)
        .addPatient(
            any(UUID.class),
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            argThat((emails) -> emails.get(0).equals("fred.fosbury@foo.com")),
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            any());
  }
}
