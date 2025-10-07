package gov.cdc.usds.simplereport.api.pxp;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import gov.cdc.usds.simplereport.api.BaseFullStackTest;
import gov.cdc.usds.simplereport.api.CurrentAccountRequestContextHolder;
import gov.cdc.usds.simplereport.api.ResourceLinks;
import gov.cdc.usds.simplereport.api.WebhookContextHolder;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.TextMessageSent;
import gov.cdc.usds.simplereport.db.repository.TextMessageSentRepository;
import gov.cdc.usds.simplereport.service.sms.TextMessageStatusService;
import gov.cdc.usds.simplereport.service.sms.TwilioWrapper;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.xml.bind.DatatypeConverter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

@TestPropertySource(properties = {
    "twilio.enabled=true",
    "TWILIO_AUTH_TOKEN=test-token",
    "twilio.messaging-service-sid=test-sid",
    "TWILIO_ACCOUNT_SID=test-account-sid"
})
class SmsCallbackControllerTest extends BaseFullStackTest {

  @Autowired private MockMvc _mockMvc;
  @Autowired private TestDataFactory _dataFactory;
  @Autowired private TextMessageSentRepository _textMessageSentRepo;

  @MockBean private WebhookContextHolder contextHolder;
  @MockBean private CurrentAccountRequestContextHolder accountContextHolder;
  @MockBean private CurrentPatientContextHolder patientContextHolder;
  @MockBean private TwilioWrapper twilioWrapper;

  @Value("${simple-report.twilio-callback-url:https://simplereport.gov/api/pxp/callback}")
  private String twilioCallbackUrl;

  @Value("${TWILIO_AUTH_TOKEN:MISSING}")
  private String twilioAuthToken;

  @Mock private TextMessageStatusService _textMessageStatusService;
  @Mock private WebhookContextHolder _webhookContextHolder;
  private SmsCallbackController _smsCallbackController;

  @BeforeEach
  void before() {
    truncateDb();

    when(_textMessageStatusService.validateSmsCallback(any())).thenReturn(true);
    this._smsCallbackController =
        new SmsCallbackController(_textMessageStatusService, _webhookContextHolder);
  }

  @Test
  void badTwilioVerification() throws Exception {
    String requestBody = "food=hamburger&drink=coffee";
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.TWILIO_CALLBACK)
            .header("X-Twilio-Signature", "bad-signature")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    this._mockMvc.perform(builder).andExpect(status().isForbidden());
  }

  @Test
  void badTwilioAuthToken() throws Exception {
    String requestBody = "food=hamburger&drink=coffee";

    String signature =
        createSignature(Map.of("food", "hamburger", "drink", "coffee"), "attacker-token");

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.TWILIO_CALLBACK)
            .header("X-Twilio-Signature", signature)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    this._mockMvc.perform(builder).andExpect(status().isForbidden());
  }

  @Test
  void successfulCallback() throws Exception {
    when(contextHolder.isWebhook()).thenReturn(true);

    String messageId = "some-message-id";
    String messageStatus = "delivered";

    Organization org = _dataFactory.saveValidOrganization();
    Facility f = _dataFactory.createValidFacility(org);
    Person p = _dataFactory.createFullPerson(org);
    TestOrder to = _dataFactory.createTestOrder(p, f);
    PatientLink pl = _dataFactory.createPatientLink(to);
    TextMessageSent message = new TextMessageSent(pl, messageId);
    _textMessageSentRepo.save(message);

    String requestBody = String.format("MessageSid=%s&MessageStatus=%s", messageId, messageStatus);
    String signature =
        createSignature(
            Map.of("MessageSid", messageId, "MessageStatus", messageStatus), twilioAuthToken);

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.TWILIO_CALLBACK + "?someQueryKey=unimportant")
            .header("X-Twilio-Signature", signature)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    this._mockMvc.perform(builder).andExpect(status().isOk());
  }

  private String createSignature(Map<String, String> params, String token) throws Exception {
    StringBuilder builder = new StringBuilder(twilioCallbackUrl);
    if (params != null) {
      List<String> sortedKeys = new ArrayList<String>(params.keySet());
      Collections.sort(sortedKeys);

      for (String key : sortedKeys) {
        builder.append(key);
        String value = params.get(key);
        builder.append(value == null ? "" : value);
      }
    }

    Mac mac = Mac.getInstance("HmacSHA1");
    mac.init(new SecretKeySpec(token.getBytes(), "HmacSHA1"));
    byte[] rawHmac = mac.doFinal(builder.toString().getBytes(StandardCharsets.UTF_8));
    return DatatypeConverter.printBase64Binary(rawHmac);
  }

  @Test
  void landlineErrorEventMsg() {
    HttpServletRequest mockedRequest = mock(HttpServletRequest.class);
    MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
    String twilioNumber = "+11234567890";
    String messageId = "123";
    body.add("ErrorCode", "30006");
    body.add("To", twilioNumber);
    body.add("MessageStatus", "undelivered");
    body.add("MessageSid", messageId);

    ArgumentCaptor<String> messageIdCaptor = ArgumentCaptor.forClass(String.class);
    ArgumentCaptor<String> phoneNumbersCaptor = ArgumentCaptor.forClass(String.class);
    this._smsCallbackController.callback(body, mockedRequest);
    verify(this._textMessageStatusService)
        .handleLandlineError(messageIdCaptor.capture(), phoneNumbersCaptor.capture());
    assertEquals(twilioNumber, phoneNumbersCaptor.getValue());
    assertEquals(messageId, messageIdCaptor.getValue());
  }
}
