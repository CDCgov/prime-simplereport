package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.SpecimenBodySite;
import java.util.List;

/** Specification of AuditedEntityRepository for {@link SpecimenBodySite} manipulation. */
public interface SpecimenBodySiteRepository extends AuditedEntityRepository<SpecimenBodySite> {

  List<SpecimenBodySite> findBySnomedSpecimenCode(String snomedSpecimenCode);

  List<SpecimenBodySite> findBySnomedSiteCode(String snomedSiteCode);

  SpecimenBodySite findBySnomedSpecimenAndSiteCodes(
      String snomedSpecimenCode, String snomedSiteCode);
}
