package gov.cdc.usds.simplereport.service.sms;

import com.twilio.security.RequestValidator;
import gov.cdc.usds.simplereport.api.model.errors.InvalidTwilioCallbackException;
import gov.cdc.usds.simplereport.db.model.auxiliary.SmsStatusCallback;
import java.util.HashMap;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service("smsValidationService")
public class SmsValidationService {

  private final RequestValidator validator;

  @Value("${simple-report.twilio-callback-url:https://simplereport.gov/api/pxp/callback}")
  private static String twilioCallbackUrl;

  public SmsValidationService(@Value("${TWILIO_AUTH_TOKEN:MISSING}") String authToken) {
    this.validator = new RequestValidator(authToken);
  }

  public boolean validateSmsCallback(HttpServletRequest request, SmsStatusCallback body)
      throws InvalidTwilioCallbackException {
    String twilioSignature = request.getHeader("X-Twilio-Signature");
    HashMap<String, String> params = new HashMap<>();
    params.put("To", body.getTo());
    params.put("AccountSid", body.getAccountSid());
    params.put("ApiVersion", body.getApiVersion());
    params.put("SmsSid", body.getSmsSid());
    params.put("SmsStatus", body.getSmsStatus());
    params.put("From", body.getFrom());
    params.put("MessageStatus", body.getMessageStatus());
    params.put("MessageSid", body.getMessageSid());
    if (validator.validate(twilioCallbackUrl, params, twilioSignature)) {
      return true;
    }
    throw new InvalidTwilioCallbackException();
  }
}
