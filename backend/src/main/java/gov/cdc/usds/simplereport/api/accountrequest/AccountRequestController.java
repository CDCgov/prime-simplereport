package gov.cdc.usds.simplereport.api.accountrequest;

import static gov.cdc.usds.simplereport.config.WebConfiguration.ACCOUNT_REQUEST;

import gov.cdc.usds.simplereport.api.model.accountrequest.AccountRequest;
import gov.cdc.usds.simplereport.api.model.accountrequest.WaitlistRequest;
import gov.cdc.usds.simplereport.properties.SendGridProperties;
import gov.cdc.usds.simplereport.service.email.EmailService;
import java.io.IOException;
import javax.annotation.PostConstruct;
import javax.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Note that this controller is unauthorized. */
@ConditionalOnProperty(name = "simple-report.feature-flags.account-request", havingValue = "true")
@RestController
@RequestMapping(ACCOUNT_REQUEST)
public class AccountRequestController {
  private static final Logger LOG = LoggerFactory.getLogger(AccountRequestController.class);

  @Autowired SendGridProperties sendGridProperties;

  @Autowired EmailService emailService;

  @PostConstruct
  private void init() {
    LOG.info("Account request REST endpoint enabled");
  }
  /** Read the waitlist request and generate an email body, then send with the emailService */
  @PostMapping("/waitlist")
  public void submitWaitlistRequest(@Valid @RequestBody WaitlistRequest body) throws IOException {
    String subject = "New waitlist request";
    String content = body.generateEmailBody();

    emailService.send(sendGridProperties.getAccountRequestRecipient(), subject, content);
  }
  /** Read the account request and generate an email body, then send with the emailService */
  @PostMapping("")
  public void submitAccountRequest(@Valid @RequestBody AccountRequest body) throws IOException {
    String subject = "New account request";
    String content = body.generateEmailBody();

    emailService.send(sendGridProperties.getAccountRequestRecipient(), subject, content);
  }
}
