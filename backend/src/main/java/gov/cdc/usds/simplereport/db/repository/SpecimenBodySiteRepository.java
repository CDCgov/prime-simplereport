package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.SpecimenBodySite;
import java.util.List;

/** Specification of EternalAuditedEntityRepository for {@link SpecimenBodySite} manipulation. */
public interface SpecimenBodySiteRepository extends EternalAuditedEntityRepository<SpecimenBodySite> {

  List<SpecimenBodySite> findBySnomedSpecimenCode(String snomedSpecimenCode);

  Specimen findBySnomedSiteCode(String snomedSiteCode);
}
