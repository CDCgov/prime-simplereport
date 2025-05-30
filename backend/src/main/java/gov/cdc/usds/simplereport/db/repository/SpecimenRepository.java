package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Specimen;
import java.util.List;

/** Specification of EternalAuditedEntityRepository for {@link Specimen} manipulation. */
public interface SpecimenRepository extends EternalAuditedEntityRepository<Specimen> {

  List<Specimen> findByLoincSystemCode(String loincSystemCode);

  Specimen findByLoincSystemCodeAndSnomedCode(String loincSystemCode, String snomedCode);
}
