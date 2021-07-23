package gov.cdc.usds.simplereport.service.sms;

import com.twilio.security.RequestValidator;
import gov.cdc.usds.simplereport.api.model.errors.InvalidTwilioCallbackException;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service("smsValidationService")
public class SmsValidationService {

  private final RequestValidator validator;

  private static final Logger LOG = LoggerFactory.getLogger(SmsValidationService.class);

  @Value("${simple-report.twilio-callback-url:https://simplereport.gov/api/pxp/callback}")
  private static String twilioCallbackUrl;

  public SmsValidationService(@Value("${TWILIO_AUTH_TOKEN:MISSING}") String authToken) {
    this.validator = new RequestValidator(authToken);
  }

  public boolean validateSmsCallback(HttpServletRequest request)
      throws InvalidTwilioCallbackException {
    String twilioSignature = request.getHeader("X-Twilio-Signature");
    Map<String, String> params = getParameterMap(request);
    LOG.info("Twilio signature: {}, Params: {}", twilioSignature, StringUtils.join(params));
    if (validator.validate(twilioCallbackUrl, params, twilioSignature)) {
      return true;
    }
    throw new InvalidTwilioCallbackException();
  }

  private static Map<String, String> getParameterMap(HttpServletRequest request) {
    Map<String, String[]> springParameterMap = request.getParameterMap();
    Map<String, String> parameterMap = new HashMap<>();
    for (String parameterName : springParameterMap.keySet()) {
      String[] values = springParameterMap.get(parameterName);
      if (values != null && values.length > 0) {
        parameterMap.put(parameterName, values[0]);
      } else {
        parameterMap.put(parameterName, null);
      }
    }
    return parameterMap;
  }
}
