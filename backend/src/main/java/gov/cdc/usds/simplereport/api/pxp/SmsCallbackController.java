package gov.cdc.usds.simplereport.api.pxp;

import gov.cdc.usds.simplereport.db.model.auxiliary.SmsStatusCallback;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pxp/callback")
@PreAuthorize("@smsValidationService.validateSmsCallback(#request, #body)")
@Validated
public class SmsCallbackController {
  private static final Logger LOG = LoggerFactory.getLogger(SmsCallbackController.class);

  @PostMapping(value = "", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
  public void register(SmsStatusCallback body, HttpServletRequest request) {
    LOG.info("messageSid={} status={}", body.getMessageSid(), body.getMessageStatus());
  }
}
