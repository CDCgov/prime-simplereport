package gov.cdc.usds.simplereport.service.sms;

import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumber;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.twilio.security.RequestValidator;
import gov.cdc.usds.simplereport.api.model.errors.InvalidTwilioCallbackException;
import gov.cdc.usds.simplereport.api.model.errors.InvalidTwilioMessageIdentifierException;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.TextMessageSent;
import gov.cdc.usds.simplereport.db.model.TextMessageStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.repository.PhoneNumberRepository;
import gov.cdc.usds.simplereport.db.repository.TextMessageSentRepository;
import gov.cdc.usds.simplereport.db.repository.TextMessageStatusRepository;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(SpringExtension.class)
class TextMessageStatusServiceMockitoTest {

  @Mock private PhoneNumberRepository _phoneRepo;
  @Mock private RequestValidator validator;
  @Mock private TextMessageSentRepository sentRepo;
  @Mock private TextMessageStatusRepository statusRepo;

  @InjectMocks
  private TextMessageStatusService textMessageStatusService =
      new TextMessageStatusService("123", sentRepo, statusRepo, _phoneRepo);

  @BeforeEach
  void setup() {
    ReflectionTestUtils.setField(
        textMessageStatusService, "twilioCallbackUrl", "https://simplereport.gov/api/pxp/callback");
    ReflectionTestUtils.setField(textMessageStatusService, "validator", validator);
  }

  @Test
  void saveTextMessageStatus_invalidMessageId() {
    assertThrows(
        InvalidTwilioMessageIdentifierException.class,
        () -> textMessageStatusService.saveTextMessageStatus(null, "delivered"));
  }

  @Test
  void saveTextMessageStatus_success() {
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
  void validateSmsCallback_invalidTwilioCallback() {
    HttpServletRequest mockedRequest = mock(HttpServletRequest.class);
    when(validator.validate(anyString(), anyMap(), anyString()))
        .thenThrow(InvalidTwilioCallbackException.class);
    assertThrows(
        InvalidTwilioCallbackException.class,
        () -> textMessageStatusService.validateSmsCallback(mockedRequest));
  }

  @Test
  void checksHandleLandlineError() {
    String toParam = "+11234567890";

    String number = parsePhoneNumber(toParam);
    List<PhoneNumber> testNumbers = new ArrayList<PhoneNumber>();
    testNumbers.add(new PhoneNumber(PhoneType.MOBILE, number));
    when(_phoneRepo.findAllByNumberAndType(anyString(), any(PhoneType.class)))
        .thenReturn(testNumbers);

    ArgumentCaptor<List> phoneNumbersCaptor = ArgumentCaptor.forClass(List.class);
    textMessageStatusService.handleLandlineError(toParam);

    verify(_phoneRepo).findAllByNumberAndType(number, PhoneType.MOBILE);
    verify(_phoneRepo).saveAll(phoneNumbersCaptor.capture());
    List<PhoneNumber> modifiedNumbers = phoneNumbersCaptor.getValue();
    assertEquals(1, modifiedNumbers.size());
    assertEquals(PhoneType.LANDLINE, modifiedNumbers.get(0).getType());
  }
}
