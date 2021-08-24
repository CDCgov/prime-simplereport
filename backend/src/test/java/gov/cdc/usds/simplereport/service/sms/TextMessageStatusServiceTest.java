package gov.cdc.usds.simplereport.service.sms;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.api.model.errors.InvalidTwilioMessageIdentifierException;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.TextMessageSent;
import gov.cdc.usds.simplereport.db.model.TextMessageStatus;
import gov.cdc.usds.simplereport.db.repository.TextMessageSentRepository;
import gov.cdc.usds.simplereport.db.repository.TextMessageStatusRepository;
import gov.cdc.usds.simplereport.service.BaseServiceTest;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
class TextMessageStatusServiceTest extends BaseServiceTest<TextMessageStatusService> {

  @Autowired TextMessageStatusService _service;
  @Autowired TextMessageSentRepository _textMessageSentRepo;
  @Autowired TextMessageStatusRepository _textMessageStatusRepo;
  @Autowired TestDataFactory _dataFactory;

  @Test
  void saveTextMessageStatus_invalidMessageId() {
    assertThrows(
        InvalidTwilioMessageIdentifierException.class,
        () -> _service.saveTextMessageStatus("some-bad-id", "delivered"));
  }

  @Test
  void saveTextMessageStatus_success() {
    String messageId = "some-message-id";
    String messageStatus = "delivered";

    Organization org = _dataFactory.createValidOrg();
    Facility f = _dataFactory.createValidFacility(org);
    Person p = _dataFactory.createFullPerson(org);
    TestOrder to = _dataFactory.createTestOrder(p, f);
    PatientLink pl = _dataFactory.createPatientLink(to);
    TextMessageSent message = new TextMessageSent(pl, messageId);
    _textMessageSentRepo.save(message);

    _service.saveTextMessageStatus(messageId, messageStatus);

    List<TextMessageStatus> statuses = _textMessageStatusRepo.findAllByTextMessageSent(message);

    assertEquals(1, statuses.size());
    assertEquals(messageStatus, statuses.get(0).getStatus());
  }
}
