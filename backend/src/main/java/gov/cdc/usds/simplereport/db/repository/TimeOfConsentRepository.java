package gov.cdc.usds.simplereport.db.repository;

import java.util.List;

import gov.cdc.usds.simplereport.db.model.TimeOfConsent;
import gov.cdc.usds.simplereport.db.model.PatientLink;

public interface TimeOfConsentRepository extends EternalAuditedEntityRepository<TimeOfConsent> {

    public List<TimeOfConsent> findAllByPatientLink(PatientLink pl);
}
