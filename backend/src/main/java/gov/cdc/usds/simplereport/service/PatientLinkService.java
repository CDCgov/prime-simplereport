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

@Service("patientLinkService")
@Transactional(readOnly = false)
public class PatientLinkService {
  @Autowired private PatientLinkRepository plrepo;

  @Autowired private TestOrderRepository torepo;

  @Autowired private CurrentPatientContextHolder contextHolder;

  public static final long oneDay = 24L;

  public PatientLink getPatientLink(String internalId) {
    UUID actualId = UUID.fromString(internalId);
    return plrepo
        .findById(actualId)
        .orElseThrow(
            () -> new IllegalGraphqlArgumentException("No patient link with that ID was found"));
  }

  public PatientLink getPatientLinkCurrent(String internalId) {
    PatientLink pl = getPatientLink(internalId);
    if (pl.isExpired()) {
      throw new ExpiredPatientLinkException();
    }
    return pl;
  }

  public boolean verifyPatientLink(String internalId, LocalDate birthDate) {
    try {
      PatientLink patientLink = getPatientLink(internalId);
      TestOrder testOrder = patientLink.getTestOrder();
      Person patient = testOrder.getPatient();
      if (testOrder.getPatient().getBirthDate().equals(birthDate)) {
        contextHolder.setContext(patientLink, testOrder, patient);
        return true;
      }
      return false;
    } catch (IllegalGraphqlArgumentException e) {
      return false;
    }
  }

  public Person getPatientFromLink(String internalId) {
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

  public PatientLink refreshPatientLink(String internalId) {
    PatientLink pl = getPatientLink(internalId);
    pl.refresh();
    return plrepo.save(pl);
  }
}
