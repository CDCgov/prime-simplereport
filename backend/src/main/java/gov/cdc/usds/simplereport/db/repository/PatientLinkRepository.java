package gov.cdc.usds.simplereport.db.repository;

import java.util.Optional;

import gov.cdc.usds.simplereport.db.model.PatientLink;

public interface PatientLinkRepository extends EternalEntityRepository<PatientLink> {

    public Optional<PatientLink> findByTestOrderId(String testOrderId);
}
