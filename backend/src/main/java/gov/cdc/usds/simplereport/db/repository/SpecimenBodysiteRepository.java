package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.SpecimenBodysite;
import java.util.List;

/** Specification of AuditedEntityRepository for {@link SpecimenBodysite} manipulation. */
public interface SpecimenBodysiteRepository extends AuditedEntityRepository<SpecimenBodysite> {

  List<SpecimenBodysite> findBySnomedSpecimenCode(String snomedSpecimenCode);

  List<SpecimenBodysite> findBySnomedSiteCode(String snomedSiteCode);

  SpecimenBodysite findBySnomedSpecimenCodeAndSnomedSiteCode(
      String snomedSpecimenCode, String snomedSiteCode);
}
