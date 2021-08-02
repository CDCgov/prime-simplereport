package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.ExpiredPatientLinkException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.PatientLinkFailedAttempt;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.repository.PatientLinkFailedAttemptRepository;
import gov.cdc.usds.simplereport.db.repository.PatientLinkRepository;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;
import java.time.LocalDate;
import java.util.List;
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

  @Autowired private PatientLinkFailedAttemptRepository plfarepo;

  @Autowired private TestOrderRepository torepo;

  @Autowired private CurrentPatientContextHolder contextHolder;

  public PatientLink getPatientLink(TestOrder testOrder) {
    List<PatientLink> results = plrepo.findByTestOrder(testOrder);
    if(results.size() == 0) {
      throw new IllegalGraphqlArgumentException("No patient link was found for this Test Order");
    }
    results.sort((pl1, pl2) -> {
      if(pl1.getCreatedAt().equals(pl2.getCreatedAt())) {
          return 0;
      } else if(pl1.getCreatedAt().before(pl2.getCreatedAt())) {
          return -1;
      } else return 1;
    });
    return results.get(0);
  }

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
    PatientLinkFailedAttempt patientLinkFailedAttempt =
        plfarepo.findById(pl.getInternalId()).orElse(new PatientLinkFailedAttempt(pl));
    patientLinkFailedAttempt.resetFailedAttempts();
    plfarepo.save(patientLinkFailedAttempt);
    pl.refresh();
    return plrepo.save(pl);
  }

  public boolean verifyPatientLink(UUID internalId, LocalDate birthDate)
      throws ExpiredPatientLinkException {
    try {
      PatientLink patientLink = getPatientLink(internalId);
      LOG.trace("Found a patient link for id={}", internalId);

      PatientLinkFailedAttempt patientLinkFailedAttempt =
          plfarepo
              .findById(patientLink.getInternalId())
              .orElse(new PatientLinkFailedAttempt(patientLink));
      if (patientLinkFailedAttempt.isLockedOut()) {
        throw new ExpiredPatientLinkException();
      }

      TestOrder testOrder = patientLink.getTestOrder();
      Person patient = testOrder.getPatient();

      if (patient.getBirthDate().equals(birthDate)) {
        LOG.trace("Successfully authenticated patient {}", patient.getInternalId());
        contextHolder.setContext(patientLink, testOrder, patient);
        if (patientLink.isExpired()) {
          LOG.trace("Link is expired!");
          throw new ExpiredPatientLinkException();
        }
        patientLinkFailedAttempt.resetFailedAttempts();
        plfarepo.save(patientLinkFailedAttempt);
        return true;
      }

      patientLinkFailedAttempt.addFailedAttempt();
      plfarepo.save(patientLinkFailedAttempt);
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
