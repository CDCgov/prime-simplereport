package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.TextMessageSent;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.stream.StreamSupport;
import javax.persistence.PersistenceException;
import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class TextMessageSentRepositoryTest extends BaseRepositoryTest {
  @Autowired private TextMessageSentRepository _repo;
  @Autowired private TestDataFactory _dataFactory;

  private PatientLink _pl1;
  private PatientLink _pl2;

  @BeforeEach
  public void init() {
    Organization org = _dataFactory.saveValidOrganization();
    Person p1 = _dataFactory.createFullPerson(org);
    Person p2 = _dataFactory.createFullPerson(org);
    Facility f = _dataFactory.createValidFacility(org);
    TestOrder to1 = _dataFactory.createTestOrder(p1, f);
    TestOrder to2 = _dataFactory.createTestOrder(p2, f);
    _pl1 = _dataFactory.createPatientLink(to1);
    _pl2 = _dataFactory.createPatientLink(to2);
  }

  @Test
  void multipleMessageIdsPerLink_succeeds() {
    _repo.save(new TextMessageSent(_pl1, "first"));
    _repo.save(new TextMessageSent(_pl1, "second"));
    assertEquals(
        2,
        StreamSupport.stream(_repo.findAll().spliterator(), false)
            .filter(
                m ->
                    m.getTwilioMessageId().equals("first")
                        || m.getTwilioMessageId().equals("second"))
            .count());
  }

  @Test
  void sameMessageIdTwice_fails() {
    _repo.save(new TextMessageSent(_pl1, "some-id"));
    TextMessageSent msg = new TextMessageSent(_pl2, "some-id");
    _repo.save(msg);
    PersistenceException caught =
        assertThrows(
            PersistenceException.class,
            () -> {
              flush();
            });

    assertEquals(ConstraintViolationException.class, caught.getCause().getClass());
  }
}
