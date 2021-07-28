package gov.cdc.usds.simplereport.api.pxp;

import gov.cdc.usds.simplereport.api.SmsWebhookContextHolder;
import gov.cdc.usds.simplereport.db.model.auxiliary.SmsStatusCallback;
import gov.cdc.usds.simplereport.service.sms.TextMessageStatusService;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pxp/callback")
@PreAuthorize("@textMessageStatusService.validateSmsCallback(#request)")
@PostAuthorize("@restAuditLogManager.logWebhookSuccess(#request, returnObject)")
@Validated
public class SmsCallbackController {
  private static final Logger LOG = LoggerFactory.getLogger(SmsCallbackController.class);
  private final TextMessageStatusService statusService;
  private final SmsWebhookContextHolder smsWebhookContextHolder;

  public SmsCallbackController(
      TextMessageStatusService statusService, SmsWebhookContextHolder smsWebhookContextHolder) {
    this.statusService = statusService;
    this.smsWebhookContextHolder = smsWebhookContextHolder;
  }

  @PostMapping(value = "", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
  public void register(SmsStatusCallback body, HttpServletRequest request) {
    smsWebhookContextHolder.setIsSmsWebhook(true);
    LOG.info(
        "Twilio callback messageSid={} status={}", body.getMessageSid(), body.getMessageStatus());
    statusService.saveTextMessageStatus(body.getMessageSid(), body.getMessageStatus());
  }
}
