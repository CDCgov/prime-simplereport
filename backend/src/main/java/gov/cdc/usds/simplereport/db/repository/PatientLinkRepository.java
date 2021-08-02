package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.TestOrder;

import java.util.List;
import java.util.Optional;

public interface PatientLinkRepository extends EternalAuditedEntityRepository<PatientLink> {

  List<PatientLink> findByTestOrder(TestOrder to);
}
