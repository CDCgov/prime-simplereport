package gov.cdc.usds.simplereport.api.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;

class TestDescriptionTest {

  @Test
  void construction_validInputs_expectedOutputs() {
    TestDescription desc = new TestDescription("CODE", "LONG", "SHORT", "DISPLAY", "CONSUMER");
    assertEquals("CODE", desc.getLoincCode());
    assertEquals("LONG", desc.getLongName());
    assertEquals("SHORT", desc.getShortName());
    assertEquals("DISPLAY", desc.getDisplayName());
    assertEquals("CONSUMER", desc.getConsumerName());
  }

  @Test
  void findTestDescription_invalid_defaultFound() {
    TestDescription desc = TestDescription.findTestDescription("nope");
    assertNotNull(desc);
    assertEquals("Unknown", desc.getLoincCode());
    assertEquals("Unknown", desc.getShortName());
  }

  @Test
  void findTestDescription_knownTest_correctResultFound() {
    TestDescription rnaTest = TestDescription.findTestDescription("94534-5");
    assertNotNull(rnaTest);
    assertEquals(
        "SARS-CoV-2 (COVID-19) RdRp gene [Presence] in Respiratory specimen by NAA with probe detection",
        rnaTest.getLongName());
  }
}
