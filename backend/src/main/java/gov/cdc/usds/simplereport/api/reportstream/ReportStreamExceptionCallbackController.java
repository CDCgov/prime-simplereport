package gov.cdc.usds.simplereport.api.reportstream;

import gov.cdc.usds.simplereport.config.WebConfiguration;
import gov.cdc.usds.simplereport.db.model.ReportStreamException;
import gov.cdc.usds.simplereport.service.ReportStreamExceptionCallbackService;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(WebConfiguration.REPORT_STREAM_EXCEPTION_CALLBACK)
@PreAuthorize("@reportStreamExceptionCallbackService.validateCallback(#request)")
// TODO: wire up audit log
// @PostAuthorize("@restAuditLogManager.logWebhookSuccess(#request)")
@Validated
@RequiredArgsConstructor
public class ReportStreamExceptionCallbackController {
  private final ReportStreamExceptionCallbackService reportStreamExceptionCallbackService;

  @PostMapping(value = "")
  public void callback(
      @RequestBody ReportStreamException reportStreamException, HttpServletRequest request) {
    reportStreamExceptionCallbackService.log(reportStreamException);
    /*
            smsWebhookContextHolder.setIsSmsWebhook(true);
            SmsStatusCallback body = mapToTextMessageSent(paramMap);
            statusService.saveTextMessageStatus(body.getMessageSid(), body.getMessageStatus());
    */
  }
}
