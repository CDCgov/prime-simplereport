package gov.cdc.usds.simplereport.service.sms;

import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumber;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.twilio.security.RequestValidator;
import gov.cdc.usds.simplereport.api.model.errors.InvalidTwilioMessageIdentifierException;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.TextMessageSent;
import gov.cdc.usds.simplereport.db.model.TextMessageStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.repository.PhoneNumberRepository;
import gov.cdc.usds.simplereport.db.repository.TextMessageSentRepository;
import gov.cdc.usds.simplereport.db.repository.TextMessageStatusRepository;
import gov.cdc.usds.simplereport.service.BaseServiceTest;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.util.ReflectionTestUtils;

@TestPropertySource(properties = {"twilio.enabled=true"})
class TextMessageStatusServiceTest extends BaseServiceTest<TextMessageStatusService> {

  @Autowired TextMessageSentRepository _textMessageSentRepo;
  @Autowired TextMessageStatusRepository _textMessageStatusRepo;

  @Mock private PhoneNumberRepository _phoneRepo;
  @Mock private RequestValidator validator;
  @Mock private TextMessageSentRepository sentRepo;
  @Mock private TextMessageStatusRepository statusRepo;
  private TextMessageStatusService textMessageStatusService;

  @Test
  void saveTextMessageStatus_invalidMessageId() {
    assertThrows(
        InvalidTwilioMessageIdentifierException.class,
        () -> _service.saveTextMessageStatus("some-bad-id", "delivered"));
  }

  @BeforeEach
  void setup() {
    this.textMessageStatusService =
        new TextMessageStatusService("123", sentRepo, statusRepo, _phoneRepo);

    ReflectionTestUtils.setField(
        textMessageStatusService, "twilioCallbackUrl", "https://simplereport.gov/api/pxp/callback");
    ReflectionTestUtils.setField(textMessageStatusService, "validator", validator);
  }

  @Test
  void saveTextMessageStatus_success() {
    String messageId = "some-message-id";
    String messageStatus = "delivered";

    Organization org = _dataFactory.saveValidOrganization();
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

  @Test
  void checksSaveTextMessageStatus() {
    String messageId = "123456";
    String status = "delivered";

    TextMessageSent message = new TextMessageSent(new PatientLink(), messageId);
    when(sentRepo.findByTwilioMessageId(anyString())).thenReturn(message);

    textMessageStatusService.saveTextMessageStatus(messageId, status);

    ArgumentCaptor<String> messageIdCaptor = ArgumentCaptor.forClass(String.class);
    verify(sentRepo).findByTwilioMessageId(messageIdCaptor.capture());
    assertEquals(messageId, messageIdCaptor.getValue());

    ArgumentCaptor<TextMessageStatus> textMessageStatusCaptor =
        ArgumentCaptor.forClass(TextMessageStatus.class);
    verify(statusRepo).save(textMessageStatusCaptor.capture());
    assertEquals(status, textMessageStatusCaptor.getValue().getStatus());
  }

  @Test
  void checksSaveTextMessageStatusWithInvalidMessageId() {
    assertThrows(
        InvalidTwilioMessageIdentifierException.class,
        () -> textMessageStatusService.saveTextMessageStatus(null, "delivered"));
  }

  TextMessageSent mockTextMessageSentWithNumbers(List<PhoneNumber> phoneNumbers) {
    Person patient = mock(Person.class);
    when(patient.getPhoneNumbers()).thenReturn(phoneNumbers);
    TestOrder testOrder = mock(TestOrder.class);
    when(testOrder.getPatient()).thenReturn(patient);
    PatientLink patientLink = mock(PatientLink.class);
    when(patientLink.getTestOrder()).thenReturn(testOrder);
    TextMessageSent textSent = mock(TextMessageSent.class);
    when(textSent.getPatientLink()).thenReturn(patientLink);
    return textSent;
  }

  @Test
  void checksHandleLandlineError() {
    String toParam = "+1123456XXXX";
    String patientsNumber = "+11234567890";
    String messageId = "123";

    String number = parsePhoneNumber(patientsNumber);
    List<PhoneNumber> testNumbers = new ArrayList<PhoneNumber>();
    testNumbers.add(new PhoneNumber(PhoneType.MOBILE, number));
    when(_phoneRepo.findAllByNumberAndType(anyString(), any(PhoneType.class)))
        .thenReturn(testNumbers);

    TextMessageSent textSent = mockTextMessageSentWithNumbers(testNumbers);
    when(sentRepo.findByTwilioMessageId(anyString())).thenReturn(textSent);

    ArgumentCaptor<List> phoneNumbersCaptor = ArgumentCaptor.forClass(List.class);
    textMessageStatusService.handleLandlineError(messageId, toParam);

    verify(_phoneRepo).findAllByNumberAndType(number, PhoneType.MOBILE);
    verify(_phoneRepo).saveAll(phoneNumbersCaptor.capture());
    List<PhoneNumber> modifiedNumbers = phoneNumbersCaptor.getValue();
    assertEquals(1, modifiedNumbers.size());
    assertEquals(PhoneType.LANDLINE, modifiedNumbers.get(0).getType());
  }

  @Test
  void checksHandleLandlineError_numberNotFound() {
    String toParam = "+1123456XXXX";
    String patientsNumber = "+14445556666"; // number in the db that does not match
    String messageId = "123";

    String number = parsePhoneNumber(patientsNumber);
    List<PhoneNumber> testNumbers = new ArrayList<PhoneNumber>();
    testNumbers.add(new PhoneNumber(PhoneType.MOBILE, number));
    when(_phoneRepo.findAllByNumberAndType(anyString(), any(PhoneType.class)))
        .thenReturn(testNumbers);

    TextMessageSent textSent = mockTextMessageSentWithNumbers(testNumbers);
    when(sentRepo.findByTwilioMessageId(anyString())).thenReturn(textSent);

    textMessageStatusService.handleLandlineError(messageId, toParam);

    verify(_phoneRepo, never()).findAllByNumberAndType(number, PhoneType.MOBILE);
    verify(_phoneRepo, never()).saveAll(new ArrayList<PhoneNumber>());
  }

  @Test
  void checksHandleLandlineError_numberWithNullType() {
    String toParam = "+1123456XXXX";
    String patientsNumber = "+11234567890";
    String messageId = "123";

    String number = parsePhoneNumber(patientsNumber);
    List<PhoneNumber> testNumbers = new ArrayList<PhoneNumber>();
    testNumbers.add(new PhoneNumber(null, number)); // number in the db  has a null type
    when(_phoneRepo.findAllByNumberAndType(anyString(), any(PhoneType.class)))
        .thenReturn(testNumbers);

    TextMessageSent textSent = mockTextMessageSentWithNumbers(testNumbers);
    when(sentRepo.findByTwilioMessageId(anyString())).thenReturn(textSent);

    ArgumentCaptor<List> phoneNumbersCaptor = ArgumentCaptor.forClass(List.class);
    textMessageStatusService.handleLandlineError(messageId, toParam);

    verify(_phoneRepo).findAllByNumberAndType(number, PhoneType.MOBILE);
    verify(_phoneRepo).saveAll(phoneNumbersCaptor.capture());
    List<PhoneNumber> modifiedNumbers = phoneNumbersCaptor.getValue();
    assertEquals(1, modifiedNumbers.size());
    assertEquals(PhoneType.LANDLINE, modifiedNumbers.get(0).getType());
  }
}
