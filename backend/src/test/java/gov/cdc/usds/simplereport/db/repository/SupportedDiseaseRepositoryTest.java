package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.IncorrectResultSizeDataAccessException;

class SupportedDiseaseRepositoryTest extends BaseRepositoryTest {

  @Autowired private SupportedDiseaseRepository _repo;

  @Test
  void findSupportedDiseaseByNameContains_successful() {
    SupportedDisease covid = _repo.findSupportedDiseaseByNameContains("COVID");
    assertEquals("96741-4", covid.getLoinc());
  }

  @Test
  void findSupportedDiseaseByNameContains_needsConclusiveSearchTerm() {
    Throwable caught =
        assertThrows(
            IncorrectResultSizeDataAccessException.class,
            () -> {
              _repo.findSupportedDiseaseByNameContains("Flu");
            });
    assertTrue(caught.getMessage().contains("query did not return a unique result: 2"));
  }
}
