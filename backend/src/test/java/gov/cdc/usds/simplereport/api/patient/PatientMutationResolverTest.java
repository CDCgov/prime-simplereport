package gov.cdc.usds.simplereport.api.patient;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class PatientMutationResolverTest {
  @Autowired private TestDataFactory _dataFactory;

  @Test
  void addPatient_canAddWithBackwardsCompatibleTelephone() {
    var personService = mock(PersonService.class);

    var sut = new PatientMutationResolver(personService);

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

    var sut = new PatientMutationResolver(personService);

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
