package gov.cdc.usds.simplereport.db.model.auxiliary;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.from;

import java.util.List;
import org.hl7.fhir.r4.model.HumanName;
import org.hl7.fhir.r4.model.StringType;
import org.junit.jupiter.api.Test;

class PersonNameTest {
  @Test
  void allFields_toFHIR() {
    var personName = new PersonName("first", "middle", "last", "jr");

    var actual = personName.toFHIR();

    assertThat(actual).returns(personName.getLastName(), from(HumanName::getFamily));
    assertEquals(actual.getGiven(), List.of(personName.getFirstName(), personName.getMiddleName()));
    assertEquals(actual.getSuffix(), List.of(personName.getSuffix()));
  }

  @Test
  void noMiddleName_toFHIR() {
    var personName = new PersonName("first", null, "last", "jr");

    var actual = personName.toFHIR();

    assertEquals(actual.getGiven(), List.of(personName.getFirstName()));
  }

  @Test
  void emptyPersonName_toFHIR() {
    var personName = new PersonName(null, null, null, null);

    var actual = personName.toFHIR();

    assertThat(actual.getGiven()).hasSize(0);
    assertThat(actual.getSuffix()).hasSize(0);
    assertThat(actual.getFamily()).isNull();
  }
  // note: getGiven and getSuffix return array lists of StringType which are difficult to compare
  void assertEquals(List<StringType> actual, List<String> expected) {
    assertThat(actual.size()).isEqualTo(expected.size());
    actual.forEach(st -> assertThat(expected).contains(st.getValue()));
  }
}
