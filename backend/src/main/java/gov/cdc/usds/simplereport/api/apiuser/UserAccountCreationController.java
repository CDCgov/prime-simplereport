package gov.cdc.usds.simplereport.api.apiuser;

import static gov.cdc.usds.simplereport.config.WebConfiguration.USER_ACCOUNT_REQUEST;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Controller used for user account creation. */
@PreAuthorize("@apiUserService.verifyAccountCreationRequest()")
@RestController
@RequestMapping(USER_ACCOUNT_REQUEST)
public class UserAccountCreationController {
  private static final Logger LOG = LoggerFactory.getLogger(UserAccountCreationController.class);

  @PostConstruct
  private void init() {
    LOG.info("User account request REST endpoint enabled");
  }

  /** Dummy controller that returns the given session id. */
  @PostMapping("")
  String uid(HttpSession session) {
    System.out.println("BOOYAH" + session.getId());
    return session.getId();
  }
}
