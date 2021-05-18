package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.InvalidPatientSelfRegistrationLinkException;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.db.model.PatientRegistrationLink;
import gov.cdc.usds.simplereport.db.repository.PatientRegistrationLinkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// NOTE: as of today, only those methods exposed to graphql endpoints have method-level security.
// We will likely want to want security for the others in the near future.
@Service("patientSelfRegistrationLinkService")
@Transactional(readOnly = false)
public class PatientSelfRegistrationLinkService {

  private PatientRegistrationLinkRepository prlrepo;
  private CurrentPatientContextHolder contextHolder;

  PatientSelfRegistrationLinkService(
      PatientRegistrationLinkRepository prlrepo,
      CurrentPatientContextHolder currentPatientContextHolder) {
    this.prlrepo = prlrepo;
    this.contextHolder = currentPatientContextHolder;
  }

  public PatientRegistrationLink getPatientRegistrationLink(String patientRegistrationLink)
      throws InvalidPatientSelfRegistrationLinkException {
    return prlrepo
        .findByPatientRegistrationLink(patientRegistrationLink)
        .orElseThrow(InvalidPatientSelfRegistrationLinkException::new);
  }

  public boolean flagSelfRegistrationRequest() {
    contextHolder.setIsPatientSelfRegistrationRequest(true);
    return true;
  }
}
