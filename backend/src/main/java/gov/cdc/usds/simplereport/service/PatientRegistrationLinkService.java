package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.api.model.errors.InvalidPatientRegistrationLinkException;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientRegistrationLink;
import gov.cdc.usds.simplereport.db.repository.PatientRegistrationLinkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// NOTE: as of today, only those methods exposed to graphql endpoints have method-level security.
// We will likely want to want security for the others in the near future.
@Service("patientRegistrationLinkService")
@Transactional(readOnly = false)
public class PatientRegistrationLinkService {

  private PatientRegistrationLinkRepository prlrepo;
  private CurrentPatientContextHolder contextHolder;

  PatientRegistrationLinkService(
      PatientRegistrationLinkRepository prlrepo,
      CurrentPatientContextHolder currentPatientContextHolder) {
    this.prlrepo = prlrepo;
    this.contextHolder = currentPatientContextHolder;
  }

  public PatientRegistrationLink getPatientRegistrationLink(String patientRegistrationLink)
      throws InvalidPatientRegistrationLinkException {
    return prlrepo
        .findByPatientRegistrationLinkAndIsDeleted(patientRegistrationLink, false)
        .orElseThrow(() -> new InvalidPatientRegistrationLinkException());
  }

  public boolean flagRegistrationRequest() {
    contextHolder.setPatientRegistrationRequest(true);
    return true;
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public String createRegistrationLink(Organization org, String link) {
    PatientRegistrationLink prl = new PatientRegistrationLink(org, link);
    prlrepo.save(prl);
    return link;
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public String createRegistrationLink(Facility fac, String link) {
    PatientRegistrationLink prl = new PatientRegistrationLink(fac, link);
    prlrepo.save(prl);
    return link;
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public String updateRegistrationLink(String link, String newLink) {
    PatientRegistrationLink prl = prlrepo.findByPatientRegistrationLink(link).get();
    prl.setLink(newLink);
    prlrepo.save(prl);
    return prl.getLink();
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public String updateRegistrationLink(String link, Boolean deleted) {
    PatientRegistrationLink prl = prlrepo.findByPatientRegistrationLink(link).get();
    prl.setIsDeleted(deleted);
    prlrepo.save(prl);
    return prl.getLink();
  }
}
