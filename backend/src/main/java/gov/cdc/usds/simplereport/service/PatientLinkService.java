package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.ExpiredPatientLinkException;
import gov.cdc.usds.simplereport.api.model.errors.InvalidPatientLinkException;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.PatientLinkFailedAttempt;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.repository.PatientLinkFailedAttemptRepository;
import gov.cdc.usds.simplereport.db.repository.PatientLinkRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// NOTE: as of today, only those methods exposed to graphql endpoints have method-level security.
// We will likely want to want security for the others in the near future.
@Service("patientLinkService")
@Transactional(readOnly = false)
@Slf4j
public class PatientLinkService {

  @Autowired private PatientLinkRepository plrepo;

  @Autowired private PatientLinkFailedAttemptRepository plfarepo;

  @Autowired private TestOrderRepository torepo;

  @Autowired private TestEventRepository testEventRepository;

  @Autowired private CurrentPatientContextHolder contextHolder;

  public PatientLink getPatientLink(UUID internalId) {
    return plrepo.findById(internalId).orElseThrow(InvalidPatientLinkException::new);
  }

  public PatientLink getPatientLinkForTestEvent(UUID testEventID) {
    TestOrder testOrder =
        testEventRepository.findById(testEventID).map(TestEvent::getTestOrder).orElse(null);

    if (testOrder != null) {
      Optional<PatientLink> firstByTestOrderInternalId = plrepo.findFirstByTestOrder(testOrder);
      return firstByTestOrderInternalId.orElseGet(() -> plrepo.save(new PatientLink(testOrder)));
    }

    return null;
  }

  public PatientLink getRefreshedPatientLink(UUID internalId) {
    PatientLink pl = plrepo.findById(internalId).orElseThrow(InvalidPatientLinkException::new);
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
      log.trace("Found a patient link for id={}", internalId);

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
        log.trace("Successfully authenticated patient {}", patient.getInternalId());
        contextHolder.setContext(patientLink, testOrder, patient);
        if (patientLink.isExpired()) {
          log.trace("Link is expired!");
          throw new ExpiredPatientLinkException();
        }
        patientLinkFailedAttempt.resetFailedAttempts();
        plfarepo.save(patientLinkFailedAttempt);
        return true;
      }

      patientLinkFailedAttempt.addFailedAttempt();
      plfarepo.save(patientLinkFailedAttempt);
      return false;
    } catch (InvalidPatientLinkException e) {
      // patient link id was invalid
      return false;
    }
  }

  public PatientLink createPatientLink(UUID testOrderUuid) {
    TestOrder to = torepo.findById(testOrderUuid).orElseThrow(InvalidPatientLinkException::new);
    PatientLink pl = new PatientLink(to);
    return plrepo.save(pl);
  }
}
