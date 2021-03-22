package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.ExpiredPatientLinkException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.repository.PatientLinkRepository;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;
import java.time.LocalDate;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// NOTE: as of today, only those methods exposed to graphql endpoints have method-level security.
// We will likely want to want security for the others in the near future.
@Service("patientLinkService")
@Transactional(readOnly = false)
public class PatientLinkService {

  private static final Logger LOG = LoggerFactory.getLogger(PatientLinkService.class);

  @Autowired private PatientLinkRepository plrepo;

  @Autowired private TestOrderRepository torepo;

  @Autowired private CurrentPatientContextHolder contextHolder;

  public PatientLink getPatientLink(UUID internalId) {
    return plrepo
        .findById(internalId)
        .orElseThrow(
            () -> new IllegalGraphqlArgumentException("No patient link with that ID was found"));
  }

  public boolean verifyPatientLink(UUID internalId, LocalDate birthDate)
      throws ExpiredPatientLinkException {
    try {
      PatientLink patientLink = getPatientLink(internalId);
      LOG.trace("Found a patient link for id={}", internalId);
      TestOrder testOrder = patientLink.getTestOrder();
      Person patient = testOrder.getPatient();
      if (patient.getBirthDate().equals(birthDate)) {
        LOG.trace("Successfully authenticated patient {}", patient.getInternalId());
        contextHolder.setContext(patientLink, testOrder, patient);
        if (patientLink.isExpired()) {
          LOG.trace("Link is expired!");
          throw new ExpiredPatientLinkException();
        }
        return true;
      }
      return false;
    } catch (IllegalGraphqlArgumentException e) {
      return false;
    }
  }

  public Person getPatientFromLink(UUID internalId) {
    PatientLink pl = getPatientLink(internalId);
    return pl.getTestOrder().getPatient();
  }

  public PatientLink createPatientLink(UUID testOrderUuid) {
    TestOrder to =
        torepo
            .findById(testOrderUuid)
            .orElseThrow(
                () -> new IllegalGraphqlArgumentException("No test order with that ID was found"));
    PatientLink pl = new PatientLink(to);
    return plrepo.save(pl);
  }

  @AuthorizationConfiguration.RequirePermissionStartTestWithPatientLink
  public PatientLink refreshPatientLink(UUID patientLinkId) {
    PatientLink pl = getPatientLink(patientLinkId);
    pl.refresh();
    return plrepo.save(pl);
  }

  public PatientLink expireMyPatientLink() {
    PatientLink pl = contextHolder.getPatientLink();
    pl.expire();
    return plrepo.save(pl);
  }
}
