package gov.cdc.usds.simplereport.db.model;

import static org.assertj.core.api.Assertions.assertThat;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.apache.commons.io.IOUtils;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.test.util.ReflectionTestUtils;

class PersonTest {
  @Test
  void toFhir_ValidPerson_ReturnsValidPatient() throws IOException {
    var birthDate = LocalDate.of(2022, 12, 13);
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    var person =
        Mockito.spy(
            new Person(
                null,
                null,
                null,
                "Austin",
                "Wingate",
                "Curtis",
                "Jr",
                birthDate,
                new StreetAddress(
                    List.of("501 Virginia St E", "#1"), "Charleston", "WV", "25301", "Kanawha"),
                "USA",
                null,
                List.of("email1", "email2"),
                "black",
                "hispanic",
                List.of("123"),
                "Male",
                false,
                false,
                "English",
                null));
    ReflectionTestUtils.setField(
        person,
        "phoneNumbers",
        List.of(
            new PhoneNumber(PhoneType.MOBILE, "304-555-1234"),
            new PhoneNumber(PhoneType.LANDLINE, "3045551233")));
    ReflectionTestUtils.setField(person, "internalId", UUID.fromString(internalId));

    var actual = person.toFhir();

    FhirContext ctx = FhirContext.forR4();
    IParser parser = ctx.newJsonParser();

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/patient.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(actualSerialized, expectedSerialized, true);
  }

  @Test
  void toFhir_EmptyPerson_EmptyPatient() {
    var person = new Person();

    var actual = person.toFhir();
    assertThat(actual.getId()).isNull();
    assertThat(actual.getName()).isEmpty();
    assertThat(actual.getTelecom()).isEmpty();
    assertThat(actual.getGender()).isEqualTo(AdministrativeGender.UNKNOWN);
    assertThat(actual.getBirthDate()).isNull();
    assertThat(actual.getAddress()).isEmpty();
    assertThat(actual.getExtension()).isEmpty();
  }
}
