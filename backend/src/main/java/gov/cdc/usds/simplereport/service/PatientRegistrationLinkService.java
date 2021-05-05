package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.InvalidPatientRegistrationLinkException;
import gov.cdc.usds.simplereport.db.model.PatientRegistrationLink;
import gov.cdc.usds.simplereport.db.repository.PatientRegistrationLinkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// NOTE: as of today, only those methods exposed to graphql endpoints have method-level security.
// We will likely want to want security for the others in the near future.
@Service("patientRegistrationLinkService")
@Transactional(readOnly = false)
public class PatientRegistrationLinkService {

  @Autowired private PatientRegistrationLinkRepository prlrepo;

  public PatientRegistrationLink getPatientRegistrationLink(String patientRegistrationLink)
      throws InvalidPatientRegistrationLinkException {
    return prlrepo
        .findByPatientRegistrationLink(patientRegistrationLink)
        .orElseThrow(() -> new InvalidPatientRegistrationLinkException());
  }
}
