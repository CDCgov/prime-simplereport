package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.db.model.ApiAuditEvent;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.auxiliary.GraphQlInputs;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class ApiAuditEventRepositoryTest extends BaseRepositoryTest {

  @Autowired private ApiAuditEventRepository _repo;
  @Autowired private OrganizationRepository _orgRepo;
  @Autowired private ApiUserRepository _userRepo;

  private static final HttpRequestDetails REQUEST =
      new HttpRequestDetails(
          "foo.com",
          "1.2.3.4",
          List.of("127.0.0.1:1", "10.0.0.0:2"),
          "ftp",
          "simplereport.name",
          "/fuzz");
  private static final GraphQlInputs API_REQ =
      new GraphQlInputs("OPPY", "get'em", Map.of("foo", "bar"));

  @Test
  void getLatestEvent_twoEvents_correctEventFound() {
    Organization org = _orgRepo.save(new Organization("RepoTestOrg", "university", "123456", true));
    ApiUser user =
        _userRepo.save(new ApiUser("joe@example.com", new PersonName("Joe", null, "Bloggs", null)));
    _repo.save(new ApiAuditEvent("AAAA", REQUEST, API_REQ, List.of(), user, List.of(), false, org));
    pause();
    _repo.save(new ApiAuditEvent("BBBB", REQUEST, API_REQ, List.of(), user, List.of(), false, org));
    flush();
    ApiAuditEvent latest = _repo.findFirst10ByOrderByEventTimestampDesc().get(0);
    assertEquals("BBBB", latest.getRequestId());
  }
}
