package gov.cdc.usds.simplereport.api.accountrequest;

import static gov.cdc.usds.simplereport.config.WebConfiguration.ACCOUNT_REQUEST;

import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.api.model.accountrequest.AccountRequest;
import gov.cdc.usds.simplereport.api.model.accountrequest.WaitlistRequest;
import gov.cdc.usds.simplereport.properties.SendGridProperties;
import gov.cdc.usds.simplereport.service.email.EmailProviderTemplate;
import gov.cdc.usds.simplereport.service.email.EmailService;
import java.io.IOException;
import javax.annotation.PostConstruct;
import javax.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Note that this controller is unauthorized. */
@RestController
@RequestMapping(ACCOUNT_REQUEST)
public class AccountRequestController {
  private static final Logger LOG = LoggerFactory.getLogger(AccountRequestController.class);

  SendGridProperties sendGridProperties;
  EmailService emailService;
  ObjectMapper objectMapper;

  public AccountRequestController(
      SendGridProperties sendGridProperties, EmailService emailService) {
    this.sendGridProperties = sendGridProperties;
    this.emailService = emailService;
    this.objectMapper = new ObjectMapper();
  }

  @PostConstruct
  private void init() {
    LOG.info("Account request REST endpoint enabled");
  }

  /** Read the waitlist request and generate an email body, then send with the emailService */
  @PostMapping("/waitlist")
  public void submitWaitlistRequest(@Valid @RequestBody WaitlistRequest body) throws IOException {
    String subject = "New waitlist request";
    if (LOG.isInfoEnabled()) {
      LOG.info("Waitlist request submitted: {}", objectMapper.writeValueAsString(body));
    }
    emailService.send(sendGridProperties.getWaitlistRecipient(), subject, body);
  }

  /** Read the account request and generate an email body, then send with the emailService */
  @PostMapping("")
  public void submitAccountRequest(@Valid @RequestBody AccountRequest body) throws IOException {
    String subject = "New account request";
    if (LOG.isInfoEnabled()) {
      LOG.info("Account request submitted: {}", objectMapper.writeValueAsString(body));
    }

    // send summary email to SR support
    emailService.send(sendGridProperties.getAccountRequestRecipient(), subject, body);
    // send next-steps email to requester
    emailService.sendWithProviderTemplate(body.getEmail(), EmailProviderTemplate.ACCOUNT_REQUEST);
  }
}
