package gov.cdc.usds.simplereport.service.sms;

import com.twilio.security.RequestValidator;
import gov.cdc.usds.simplereport.db.model.auxiliary.SmsStatusCallback;
import java.util.HashMap;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;

public class SmsValidationService {

  private final String webhookUrl;
  private final RequestValidator validator;

  public SmsValidationService(
      @Value("${TWILIO_AUTH_TOKEN}") String authToken,
      @Value("${twilio.webhookUrl}") String webhookUrl) {
    this.webhookUrl = webhookUrl;
    this.validator = new RequestValidator(authToken);
  }

  boolean validateSmsCallback(HttpServletRequest request, SmsStatusCallback body) {
    String twilioSignature = request.getHeader("X-Twilio-Signature");
    HashMap<String, String> params = new HashMap<>();
    params.put("SmsSid", body.getSmsSid());
    params.put("SmsStatus", body.getSmsStatus());
    params.put("MessageStatus", body.getMessageStatus());
    params.put("MessageSid", body.getMessageSid());
    return validator.validate(webhookUrl, params, twilioSignature);
  }
}
