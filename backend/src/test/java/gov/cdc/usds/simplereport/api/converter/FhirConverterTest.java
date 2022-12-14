package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToHumanName;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToIdentifier;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.stream.Collectors;
import org.hl7.fhir.r4.model.Identifier.IdentifierUse;
import org.hl7.fhir.r4.model.PrimitiveType;
import org.hl7.fhir.r4.model.StringType;
import org.junit.jupiter.api.Test;

public class FhirConverterTest {
  @Test
  void allFields_convertToHumanName() {
    var actual = convertToHumanName("first", "middle", "last", "jr");
    assertThat(actual.getGiven().stream().map(PrimitiveType::getValue))
        .containsExactly("first", "middle");
    assertThat(actual.getFamily()).isEqualTo("last");
    assertThat(actual.getSuffix().stream().map(PrimitiveType::getValue)).containsOnly("jr");
  }

  @Test
  void noMiddleName_convertToHumanName() {
    var actual = convertToHumanName("first", null, "last", "jr");

    assertThat(actual.getGiven().stream().map(PrimitiveType::getValue)).containsExactly("first");
  }

  @Test
  void emptyPersonName_convertToHumanName() {
    var actual = convertToHumanName(null, null, null, null);

    assertThat(actual.getGiven()).isEmpty();
    assertThat(actual.getFamily()).isNull();
    assertThat(actual.getSuffix()).isEmpty();
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
