package gov.cdc.usds.simplereport.service.sms;

import com.twilio.security.RequestValidator;
import gov.cdc.usds.simplereport.api.model.errors.InvalidTwilioCallbackException;
import gov.cdc.usds.simplereport.db.model.TextMessageSent;
import gov.cdc.usds.simplereport.db.model.TextMessageStatus;
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

@Service("textMessageStatusService")
public class TextMessageStatusService {

  private final RequestValidator validator;
  private TextMessageSentRepository sentRepo;
  private TextMessageStatusRepository statusRepo;

  @Value("${simple-report.twilio-callback-url:https://simplereport.gov/api/pxp/callback}")
  private String twilioCallbackUrl;

  public TextMessageStatusService(
      @Value("${TWILIO_AUTH_TOKEN:MISSING}") String authToken,
      TextMessageSentRepository sentRepo,
      TextMessageStatusRepository statusRepo) {
    this.validator = new RequestValidator(authToken);
    this.sentRepo = sentRepo;
    this.statusRepo = statusRepo;
  }

  public void saveTextMessageStatus(String messageId, String status) {
    TextMessageSent message = sentRepo.findByTwilioMessageId(messageId);
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
}
