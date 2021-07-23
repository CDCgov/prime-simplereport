package gov.cdc.usds.simplereport.service.sms;

import com.twilio.security.RequestValidator;
import gov.cdc.usds.simplereport.api.model.errors.InvalidTwilioCallbackException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service("smsValidationService")
public class SmsValidationService {

  private final RequestValidator validator;

  @Value("${simple-report.twilio-callback-url:https://simplereport.gov/api/pxp/callback}")
  private String twilioCallbackUrl;

  private static final Logger LOG = LoggerFactory.getLogger(SmsValidationService.class);

  public SmsValidationService(@Value("${TWILIO_AUTH_TOKEN:MISSING}") String authToken) {
    this.validator = new RequestValidator(authToken);
  }

  public boolean validateSmsCallback(HttpServletRequest request)
      throws InvalidTwilioCallbackException {
    String twilioSignature = request.getHeader("X-Twilio-Signature");
    Map<String, String> postParams = extractPostParams(request);

    LOG.info(
        "Twilio signature: {}, Params: {}, callback: {}",
        twilioSignature,
        StringUtils.join(postParams),
        twilioCallbackUrl);
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
