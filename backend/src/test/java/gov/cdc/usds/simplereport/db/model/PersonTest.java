package gov.cdc.usds.simplereport.db.model;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import java.time.LocalDate;
import java.util.List;
import org.hl7.fhir.r4.model.HumanName;
import org.hl7.fhir.r4.model.Patient;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class PersonTest {

  @Test
  void toFhirPatient() {
    var realPerson =
        new Person(
            null,
            null,
            null,
            "Austin",
            "Wingate",
            "Curtis",
            "Jr",
            LocalDate.now(),
            new StreetAddress(
                List.of("501 Virginia St E", "#1"), "Charleston", "WV", "25301", "Kanawha"),
            "USA",
            null,
            List.of("acurtis@example.com", "email@example.com"),
            "black",
            "not hispanic or latino",
            List.of(),
            "Male",
            false,
            false,
            "English",
            null);
    Person p = Mockito.spy(realPerson);
    Mockito.doReturn(
            List.of(
                new PhoneNumber(PhoneType.MOBILE, "304-555-1234"),
                new PhoneNumber(PhoneType.LANDLINE, "3045551233")))
        .when(p)
        .getPhoneNumbers();

    var actual = p.toFhirPatient();

    var expected = new Patient();
    expected.addName();
    var name = new HumanName();
    assertThat(actual);
  }
}
