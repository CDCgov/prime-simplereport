package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class SupportedDiseaseRepositoryTest extends BaseRepositoryTest {

  @Autowired private SupportedDiseaseRepository _repo;

  @Test
  void saveSupportedDisease_successful() {
    _repo.save(new SupportedDisease("COVID-19", "123"));
    assertEquals(1, _repo.findAllByName("COVID-19").size());
  }
}
