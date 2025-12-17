package gov.cdc.usds.simplereport.api.pxp;

import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.api.WebhookContextHolder;
import gov.cdc.usds.simplereport.api.model.errors.InvalidTwilioMessageIdentifierException;
import gov.cdc.usds.simplereport.db.model.auxiliary.SmsStatusCallback;
import gov.cdc.usds.simplereport.service.sms.TextMessageStatusService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.HashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.MultiValueMap;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/pxp/callback")
@PreAuthorize("@textMessageStatusService.validateSmsCallback(#request)")
@PostAuthorize("@restAuditLogManager.logWebhookSuccess(#request)")
@Validated
public class SmsCallbackController {
  private final TextMessageStatusService statusService;
  private final WebhookContextHolder webhookContextHolder;

  public SmsCallbackController(
      TextMessageStatusService statusService, WebhookContextHolder webhookContextHolder) {
    this.statusService = statusService;
    this.webhookContextHolder = webhookContextHolder;
  }

  @PostMapping(value = "")
  public void callback(
      @RequestBody MultiValueMap<String, String> paramMap, HttpServletRequest request) {
    webhookContextHolder.setIsWebhook(true);
    SmsStatusCallback body = mapToTextMessageSent(paramMap);

    try {
      statusService.saveTextMessageStatus(body.getMessageSid(), body.getMessageStatus());
    } catch (InvalidTwilioMessageIdentifierException e) {
      log.info("InvalidTwilioMessageIdentifierException with MessageSid:" + body.getMessageSid());
      throw e;
    }

    if (body.getErrorCode().equals("30006")) {
      statusService.handleLandlineError(body.getMessageSid(), body.getNumber());
    }
  }

  private SmsStatusCallback mapToTextMessageSent(MultiValueMap<String, String> paramMap) {
    HashMap<String, Object> newMap = new HashMap<>();
    Arrays.asList("MessageSid", "MessageStatus", "ErrorCode", "To")
        .forEach(
            k -> {
              if (paramMap.containsKey(k)) {
                newMap.put(k, paramMap.get(k).get(0));
              } else {
                newMap.put(k, "");
              }
            });

    return new ObjectMapper().convertValue(newMap, SmsStatusCallback.class);
  }
}
