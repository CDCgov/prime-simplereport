package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.InvalidPatientSelfRegistrationLinkException;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.repository.PatientRegistrationLinkRepository;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// NOTE: as of today, only those methods exposed to graphql endpoints have method-level security.
// We will likely want to want security for the others in the near future.
@Service("patientSelfRegistrationLinkService")
@Transactional(readOnly = false)
public class PatientSelfRegistrationLinkService {

  private PatientRegistrationLinkRepository prlrepo;
  private CurrentPatientContextHolder contextHolder;
  public static final int LINK_LENGTH = 5;
  public static final String LINK_CHARACTERS = "2346789abcdefghjkmnpqrtuvwxyz";

  PatientSelfRegistrationLinkService(
      PatientRegistrationLinkRepository prlrepo,
      CurrentPatientContextHolder currentPatientContextHolder) {
    this.prlrepo = prlrepo;
    this.contextHolder = currentPatientContextHolder;
  }

  public PatientSelfRegistrationLink getPatientRegistrationLink(String patientRegistrationLink)
      throws InvalidPatientSelfRegistrationLinkException {
    PatientSelfRegistrationLink link =
        prlrepo
            .findByPatientRegistrationLinkIgnoreCase(patientRegistrationLink)
            .orElseThrow(InvalidPatientSelfRegistrationLinkException::new);

    if (!link.getOrganization().getIdentityVerified()) {
      throw new InvalidPatientSelfRegistrationLinkException();
    }

    return link;
  }

  public boolean flagSelfRegistrationRequest() {
    contextHolder.setIsPatientSelfRegistrationRequest(true);
    return true;
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public String createRegistrationLink(Organization org, String link) {
    PatientSelfRegistrationLink prl = new PatientSelfRegistrationLink(org, link);
    prlrepo.save(prl);
    return link;
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public String createRegistrationLink(Facility fac, String link) {
    PatientSelfRegistrationLink prl = new PatientSelfRegistrationLink(fac, link);
    prlrepo.save(prl);
    return link;
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public String updateRegistrationLink(String link, String newLink) {
    PatientSelfRegistrationLink prl =
        prlrepo
            .findByPatientRegistrationLinkIgnoreCase(link)
            .orElseThrow(InvalidPatientSelfRegistrationLinkException::new);
    prl.setLink(newLink);
    prlrepo.save(prl);
    return prl.getLink();
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public String updateRegistrationLink(String link, Boolean deleted) {
    PatientSelfRegistrationLink prl =
        prlrepo
            .findByPatientRegistrationLinkIgnoreCase(link)
            .orElseThrow(InvalidPatientSelfRegistrationLinkException::new);
    prl.setIsDeleted(deleted);
    prlrepo.save(prl);
    return prl.getLink();
  }

  public String createRegistrationLink(Organization org) {
    return createRegistrationLink(org, generateUniqueLink());
  }

  public String createRegistrationLink(Facility fac) {
    return createRegistrationLink(fac, generateUniqueLink());
  }

  private String generateUniqueLink() {
    String link = generateRandomLink();
    return prlrepo.findByPatientRegistrationLinkIgnoreCase(link).isPresent()
        ? generateRandomLink()
        : link;
  }

  private static String generateRandomLink() {
    return RandomStringUtils.random(LINK_LENGTH, LINK_CHARACTERS);
  }
}
