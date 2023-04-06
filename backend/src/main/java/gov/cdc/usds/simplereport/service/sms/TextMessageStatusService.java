package gov.cdc.usds.simplereport.service.sms;

import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumber;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
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
import java.util.Optional;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("textMessageStatusService")
@Transactional
public class TextMessageStatusService {

  private PhoneNumberRepository phoneRepo;
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
    this.phoneRepo = phoneRepo;
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

  private Optional<String> getNumberByMessageId(String messageId, String twilioNumber) {
    final int PREFIX_START = 0;
    final int PREFIX_END = 8;
    var phoneUtil = PhoneNumberUtil.getInstance();
    String numberPrefix = twilioNumber.substring(PREFIX_START, PREFIX_END);
    TextMessageSent txtMsg = sentRepo.findByTwilioMessageId(messageId);
    List<PhoneNumber> patientNumbers =
        txtMsg.getPatientLink().getTestOrder().getPatient().getPhoneNumbers();

    for (PhoneNumber phoneNumber : patientNumbers) {
      try {
        String convertedNumber =
            phoneUtil.format(
                phoneUtil.parse(phoneNumber.getNumber(), "US"),
                PhoneNumberUtil.PhoneNumberFormat.E164);
        if (convertedNumber.startsWith(numberPrefix)
            && (phoneNumber.getType() == null || PhoneType.MOBILE.equals(phoneNumber.getType()))) {
          return Optional.of(phoneNumber.getNumber());
        }
      } catch (NumberParseException parseException) {
        return Optional.empty();
      }
    }

    return Optional.empty();
  }

  @Transactional
  public void handleLandlineError(String messageId, String twilioNumber) {

    Optional<String> landlineNumber = getNumberByMessageId(messageId, twilioNumber);
    if (!landlineNumber.isEmpty()) {
      List<PhoneNumber> phoneNumbers =
          phoneRepo.findAllByNumberAndType(
              parsePhoneNumber(landlineNumber.get()), PhoneType.MOBILE);

      phoneNumbers.forEach(phoneNumber -> phoneNumber.setType(PhoneType.LANDLINE));
      phoneRepo.saveAll(phoneNumbers);
    }
  }
}
