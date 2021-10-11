package gov.cdc.usds.simplereport.api.reportstream;

import gov.cdc.usds.simplereport.api.WebhookContextHolder;
import gov.cdc.usds.simplereport.api.model.ReportStreamCallbackRequest;
import gov.cdc.usds.simplereport.config.WebConfiguration;
import gov.cdc.usds.simplereport.db.model.ReportStreamResponse;
import gov.cdc.usds.simplereport.service.ReportStreamCallbackService;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(WebConfiguration.RS_QUEUE_CALLBACK)
@PreAuthorize("@reportStreamCallbackService.validateCallback(#request)")
@PostAuthorize("@restAuditLogManager.logWebhookSuccess(#request)")
@Validated
@RequiredArgsConstructor
public class ReportStreamCallbackController {
  private final ReportStreamCallbackService reportStreamCallbackService;
  private final WebhookContextHolder webhookContextHolder;

  @PostMapping(value = "")
  public void callback(
      @RequestBody ReportStreamCallbackRequest requestBody, HttpServletRequest request) {
    webhookContextHolder.setIsWebhook(true);
    reportStreamCallbackService.log(ReportStreamResponse.from(requestBody));
  }
}
