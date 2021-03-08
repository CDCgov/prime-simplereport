package gov.cdc.usds.simplereport.api.accountrequest;

import gov.cdc.usds.simplereport.api.model.accountrequest.AccountRequest;
import gov.cdc.usds.simplereport.service.email.EmailService;
import java.io.IOException;
import javax.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Note that this controller is unauthorized. */
@ConditionalOnProperty(name = "simple-report.feature-flags.account-request", havingValue = "true")
@RestController
@RequestMapping("/account-request")
@Validated
public class AccountRequestController {
  private static final Logger LOG = LoggerFactory.getLogger(AccountRequestController.class);

  @Value("${simple-report.account-request.send-to:admin@simplereport.gov}")
  private String toEmail;

  @Autowired EmailService emailService;

  @PostConstruct
  private void init() {
    LOG.info("Account request REST endpoint enabled");
  }
  /** Read the account request and generate an email body, then send with the emailService */
  @PostMapping("/submit")
  public String submitAccountRequest(@RequestBody AccountRequest body) throws IOException {
    String subject = "New account request";
    String newLine = "<br>";
    String content =
        String.join(
            newLine,
            "A new SimpleReport account request has been submitted with the following details:",
            "",
            "<b>Name: </b>" + body.getName(),
            "<b>Email address: </b>" + body.getEmail(),
            "<b>Phone number: </b>" + body.getPhone(),
            "<b>State: </b>" + body.getState(),
            "<b>Organization: </b>" + body.getOrganization(),
            "<b>Referral: </b>" + body.getReferral());
    return emailService.send(toEmail, subject, content);
  }
}
