package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.ExpiredPatientLinkException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.repository.PatientLinkRepository;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// NOTE: as of today, only those methods exposed to graphql endpoints have method-level security.
// We will likely want to want security for the others in the near future.
@Service("patientLinkService")
@Transactional(readOnly = false)
public class PatientLinkService {
  @Autowired private PatientLinkRepository plrepo;

  @Autowired private TestOrderRepository torepo;

  @Autowired private CurrentPatientContextHolder contextHolder;

  public PatientLink getPatientLink(UUID internalId) {
    return plrepo
        .findById(internalId)
        .orElseThrow(
            () -> new IllegalGraphqlArgumentException("No patient link with that ID was found"));
  }

  public PatientLink getRefreshedPatientLink(UUID internalId) {
    PatientLink pl =
        plrepo
            .findById(internalId)
            .orElseThrow(
                () ->
                    new IllegalGraphqlArgumentException("No patient link with that ID was found"));
    pl.refresh();
    return plrepo.save(pl);
  }

  public boolean verifyPatientLink(UUID internalId, LocalDate birthDate)
      throws ExpiredPatientLinkException {
    try {
      PatientLink patientLink = getPatientLink(internalId);
      if (patientLink.isLockedOut()) {
        throw new ExpiredPatientLinkException();
      }

      TestOrder testOrder = patientLink.getTestOrder();
      Person patient = testOrder.getPatient();

      if (testOrder.getPatient().getBirthDate().equals(birthDate)) {
        if (patientLink.isExpired()) {
          throw new ExpiredPatientLinkException();
        }
        contextHolder.setContext(patientLink, testOrder, patient);
        patientLink.resetFailedAttempts();
        plrepo.save(patientLink);
        return true;
      }

      patientLink.addFailedAttempt();
      plrepo.save(patientLink);
      return false;
    } catch (IllegalGraphqlArgumentException e) {
      // patient link id was invalid
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

  public PatientLink expireMyPatientLink() {
    PatientLink pl = contextHolder.getPatientLink();
    pl.expire();
    return plrepo.save(pl);
  }
}
