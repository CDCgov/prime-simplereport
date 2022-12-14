package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToHumanName;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToIdentifier;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.from;

import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import java.util.List;
import java.util.stream.Collectors;
import org.hl7.fhir.r4.model.HumanName;
import org.hl7.fhir.r4.model.Identifier.IdentifierUse;
import org.hl7.fhir.r4.model.StringType;
import org.junit.jupiter.api.Test;

public class FhirConverterTest {
  @Test
  void allFields_convertToHumanName() {
    var personName = new PersonName("first", "middle", "last", "jr");

    var actual = convertToHumanName(personName);

    assertThat(actual).returns(personName.getLastName(), from(HumanName::getFamily));
    assertStringTypeListEqualsStringList(
        List.of(personName.getFirstName(), personName.getMiddleName()), actual.getGiven());
    assertStringTypeListEqualsStringList(List.of(personName.getSuffix()), actual.getSuffix());
  }

  @Test
  void noMiddleName_convertToHumanName() {
    var personName = new PersonName("first", null, "last", "jr");

    var actual = convertToHumanName(personName);

    assertStringTypeListEqualsStringList(List.of(personName.getFirstName()), actual.getGiven());
  }

  @Test
  void emptyPersonName_convertToHumanName() {
    var personName = new PersonName(null, null, null, null);

    var actual = convertToHumanName(personName);

    assertThat(actual.getGiven()).isEmpty();
    assertThat(actual.getSuffix()).isEmpty();
    assertThat(actual.getFamily()).isNull();
  }

  @Test
  void null_convertToHumanName() {
    assertThat(convertToHumanName(null)).isNull();
  }

  @Test
  void string_convertToIdentifier() {
    var actual = convertToIdentifier("someId");

    assertThat(actual.getUse()).isEqualTo(IdentifierUse.USUAL);
    assertThat(actual.getValue()).isEqualTo("someId");
  }

  @Test
  void null_convertToIdentifier() {
    assertThat(convertToIdentifier(null)).isNull();
  }
  // note: getGiven and getSuffix return array lists of StringType which are difficult to compare
  public static void assertStringTypeListEqualsStringList(
      List<String> actual, List<StringType> expected) {
    var e = expected.stream().map(StringType::toString).collect(Collectors.toList());
    assertThat(actual).isEqualTo(e);
  }
}
