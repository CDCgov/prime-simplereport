package gov.cdc.usds.simplereport.service.sms;

import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumber;

import com.twilio.security.RequestValidator;
import gov.cdc.usds.simplereport.api.model.errors.InvalidTwilioCallbackException;
import gov.cdc.usds.simplereport.api.model.errors.InvalidTwilioMessageIdentifierException;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.TextMessageSent;
import gov.cdc.usds.simplereport.db.model.TextMessageStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.repository.PhoneNumberRepository;
import gov.cdc.usds.simplereport.db.repository.TextMessageSentRepository;
import gov.cdc.usds.simplereport.db.repository.TextMessageStatusRepository;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("textMessageStatusService")
@Transactional
public class TextMessageStatusService {

  private PhoneNumberRepository _phoneRepo;
  private final RequestValidator validator;
  private TextMessageSentRepository sentRepo;
  private TextMessageStatusRepository statusRepo;

  @Value("${simple-report.twilio-callback-url:https://simplereport.gov/api/pxp/callback}")
  private String twilioCallbackUrl;

  public TextMessageStatusService(
      @Value("${TWILIO_AUTH_TOKEN:MISSING}") String authToken,
      TextMessageSentRepository sentRepo,
      TextMessageStatusRepository statusRepo,
      PhoneNumberRepository phoneRepo) {
    this.validator = new RequestValidator(authToken);
    this.sentRepo = sentRepo;
    this.statusRepo = statusRepo;
    this._phoneRepo = phoneRepo;
  }

  public void saveTextMessageStatus(String messageId, String status) {
    TextMessageSent message = sentRepo.findByTwilioMessageId(messageId);
    if (message == null) {
      throw new InvalidTwilioMessageIdentifierException();
    }

    TextMessageStatus textMessageStatus = new TextMessageStatus(message, status);
    statusRepo.save(textMessageStatus);
  }

  public boolean validateSmsCallback(HttpServletRequest request)
      throws InvalidTwilioCallbackException {
    String twilioSignature = request.getHeader("X-Twilio-Signature");
    Map<String, String> postParams = extractPostParams(request);
    if (validator.validate(twilioCallbackUrl, postParams, twilioSignature)) {
      return true;
    }
    throw new InvalidTwilioCallbackException();
  }

  private Map<String, String> extractPostParams(HttpServletRequest request) {
    String queryString = request.getQueryString();
    Map<String, String[]> requestParams = request.getParameterMap();
    List<String> queryStringKeys = getQueryStringKeys(queryString);

    return requestParams.entrySet().stream()
        .filter(e -> !queryStringKeys.contains(e.getKey()))
        .collect(Collectors.toMap(e -> e.getKey(), e -> e.getValue()[0]));
  }

  private List<String> getQueryStringKeys(String queryString) {
    if (queryString == null || queryString.length() == 0) {
      return Collections.emptyList();
    } else {
      return Arrays.stream(queryString.split("&"))
          .map(pair -> pair.split("=")[0])
          .collect(Collectors.toList());
    }
  }

  @Transactional
  public void handleLandlineError(String msgSID, String landlineNumber) {
    List<PhoneNumber> phoneNumbers =
        _phoneRepo.findAllByNumberAndType(parsePhoneNumber(landlineNumber), PhoneType.MOBILE);

    phoneNumbers.forEach(
        phoneNumber -> {
          phoneNumber.setType(PhoneType.LANDLINE);
        });
    _phoneRepo.saveAll(phoneNumbers);
  }
}
