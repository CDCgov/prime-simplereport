package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;

public class DiseaseServiceTest extends BaseServiceTest<DiseaseService> {

  @Test
  void retrievesCovid_successful() {
    assertNotNull(_service.covid());
    assertEquals("COVID-19", _service.covid().getName());
  }

  @Test
  void retrievesFluA_successful() {
    assertNotNull(_service.fluA());
    assertEquals("Flu A", _service.fluA().getName());
  }

  @Test
  void retrievesFluB_successful() {
    assertNotNull(_service.fluB());
    assertEquals("Flu B", _service.fluB().getName());
  }
}
