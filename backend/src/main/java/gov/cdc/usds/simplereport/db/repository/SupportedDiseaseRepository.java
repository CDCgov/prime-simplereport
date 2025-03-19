package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;

public interface SupportedDiseaseRepository extends CrudRepository<SupportedDisease, UUID> {
  List<SupportedDisease> findAllByName(String name);

  Optional<SupportedDisease> findByName(String name);

  List<SupportedDisease> findByNameAndLoinc(String name, String loinc);

  @Override
  List<SupportedDisease> findAll();
}
