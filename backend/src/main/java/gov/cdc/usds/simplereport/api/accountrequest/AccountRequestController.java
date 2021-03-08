package gov.cdc.usds.simplereport.api.accountrequest;

import static gov.cdc.usds.simplereport.api.Translators.sanitize;
import static gov.cdc.usds.simplereport.config.WebConfiguration.ACCOUNT_REQUEST;

import gov.cdc.usds.simplereport.api.model.accountrequest.AccountRequest;
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
  /** Read the account request and generate an email body, then send with the emailService */
  @PostMapping("/submit")
  public void submitAccountRequest(@Valid @RequestBody AccountRequest body) throws IOException {
    String subject = "New account request";
    String newLine = "<br>";
    String name = sanitize(body.getName());
    String email = sanitize(body.getEmail());
    String phone = sanitize(body.getPhone());
    String state = sanitize(body.getState());
    String organization = sanitize(body.getOrganization());
    String referral = sanitize(body.getReferral());
    String content =
        String.join(
            newLine,
            "A new SimpleReport account request has been submitted with the following details:",
            "",
            "<b>Name: </b>" + name,
            "<b>Email address: </b>" + email,
            "<b>Phone number: </b>" + phone,
            "<b>State: </b>" + state,
            "<b>Organization: </b>" + organization,
            "<b>Referral: </b>" + referral);
    emailService.send(sendGridProperties.getAccountRequestRecipient(), subject, content);
  }
}
