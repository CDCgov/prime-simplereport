package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

class ReminderServiceTest extends BaseServiceTest<ReminderService> {

  @Autowired private DemoOktaRepository _demoOktaRepo;
  @Autowired private JdbcTemplate _jdbc;

  @Test
  void sendAccountReminderEmails_noEmails_success() {
    Map<Organization, Set<String>> orgEmailsSent = _service.sendAccountReminderEmails();
    assertEquals(Set.of(), orgEmailsSent.keySet());
  }

  @Test
  void sendAccountReminderEmails_sendEmails_success() throws SQLException {
    String email = "fake@example.org";
    Organization unverifiedOrg = _dataFactory.createUnverifiedOrg();
    backdateOrgCreatedAt(unverifiedOrg);

    // another unverified org, too new to be reminded
    _dataFactory.createValidOrg("Second Org Name", "k12", "SECOND_ORG_NAME", false);
    // verified org should not be reminded
    _dataFactory.createValidOrg();

    _demoOktaRepo.createUser(
        new IdentityAttributes(email, "First", "Middle", "Last", ""),
        unverifiedOrg,
        Set.of(),
        Set.of(OrganizationRole.NO_ACCESS, OrganizationRole.ADMIN),
        true);

    Map<Organization, Set<String>> orgEmailsSentMap = _service.sendAccountReminderEmails();
    assertEquals(1, orgEmailsSentMap.keySet().size());

    Organization remindedOrg = orgEmailsSentMap.keySet().iterator().next();
    assertEquals(unverifiedOrg.getExternalId(), remindedOrg.getExternalId());

    Set<String> remindedEmails = orgEmailsSentMap.get(remindedOrg);
    assertEquals(Set.of(email), remindedEmails);
  }

  @Transactional
  void backdateOrgCreatedAt(Organization org) throws SQLException {
    // Ugly, but avoids exposing createdAt to modification.  This backdates an organization's
    // created_at to noon gmt the previous day, which will fall in the range of times the id
    // verification reminder email will be sent to.
    String query =
        "UPDATE simple_report.organization SET created_at = (created_at - INTERVAL '1 DAY')::date + INTERVAL '12 hour' WHERE internal_id = ?";
    Connection conn = _jdbc.getDataSource().getConnection();
    PreparedStatement statement = conn.prepareStatement(query);
    statement.setObject(1, org.getInternalId());
    statement.execute();
  }
}
