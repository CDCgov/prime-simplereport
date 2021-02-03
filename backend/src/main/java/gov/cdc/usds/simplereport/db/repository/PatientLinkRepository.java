package gov.cdc.usds.simplereport.db.repository;

import java.util.Optional;

import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.TestOrder;

public interface PatientLinkRepository extends EternalEntityRepository<PatientLink> {

    public Optional<PatientLink> findByTestOrder(TestOrder to);
}
