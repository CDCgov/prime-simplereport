package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class SupportedDiseaseRepositoryTest extends BaseRepositoryTest {

  @Autowired private SupportedDiseaseRepository _repo;

  @Test
  void findSupportedDiseaseByName_successful() {
    SupportedDisease covid = _repo.findByName("COVID-19").orElse(null);
    assertNotNull(covid);
    assertEquals("96741-4", covid.getLoinc());
  }

  @Test
  void findSupportedDiseaseByName_needsConclusiveSearchTerm() {
    Optional<SupportedDisease> flu = _repo.findByName("Flu");
    assertTrue(flu.isEmpty());
  }
}
