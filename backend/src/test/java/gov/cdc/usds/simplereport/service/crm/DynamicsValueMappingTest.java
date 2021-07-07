package gov.cdc.usds.simplereport.service.crm;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.service.model.crm.DynamicsValueMapping;
import gov.cdc.usds.simplereport.service.model.crm.DynamicsValueMapping.Prefix;
import org.junit.jupiter.api.Test;

class DynamicsValueMappingTest {

  @Test
  void convertToCode_mappingExists_success() {
    assertEquals(810050001, DynamicsValueMapping.convertToCode(Prefix.AD, "Desktop computer"));
  }

  @Test
  void convertToCode_missingMapping_success() {
    assertEquals(810050000, DynamicsValueMapping.convertToCode(Prefix.AD, "Bad option"));
  }

  @Test
  void convertToCode_emptyInput_success() {
    assertEquals(810050000, DynamicsValueMapping.convertToCode(Prefix.AD, ""));
  }

  @Test
  void convertToCode_nullInput_success() {
    assertEquals(810050000, DynamicsValueMapping.convertToCode(Prefix.AD, null));
  }

  @Test
  void convertToValues_multipleOptions_success() {
    assertEquals(
        "810050001,810050002", DynamicsValueMapping.convertToValues(Prefix.B, "Firefox, Chrome"));
  }

  @Test
  void convertToValues_noMappableOptions_success() {
    // Expect the value of "Other" to be returned
    assertEquals("810050003", DynamicsValueMapping.convertToValues(Prefix.B, "Bad, Choices"));
  }

  @Test
  void convertToValues_noMappableOptionsNoOther_success() {
    // Expect the value of default option to be returned
    assertEquals("810050000", DynamicsValueMapping.convertToValues(Prefix.AD, "Bad, Choices"));
  }

  @Test
  void convertToValues_mappableAndUnmappableOptions_success() {
    // Expect the value of "Chrome" to be returned
    assertEquals("810050001", DynamicsValueMapping.convertToValues(Prefix.B, "Bad Choice, Chrome"));
  }
}
