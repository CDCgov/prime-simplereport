package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.ApiAuditEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.GraphQlInputs;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import gov.cdc.usds.simplereport.logging.GraphqlQueryState;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportEntryOnlyUser;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;

class AuditServiceTest extends BaseServiceTest<AuditService> {

  @Autowired private ApiUserService _userService;

  @Test
  @WithSimpleReportEntryOnlyUser
  void smokeTestGraphqlAudit() {
    initSampleData(); // need to have the org exist
    UserInfo userInfo = _userService.getCurrentUserInfo();
    GraphqlQueryState state = new GraphqlQueryState();
    state.setRequestId("ABCDE");
    state.setGraphqlDetails(new GraphQlInputs("A", "B", Map.of()));
    state.setHttpDetails(
        new HttpRequestDetails(
            "foo.com",
            "1.2.3.4",
            List.of("127.0.0.1:1", "10.0.0.0:2"),
            "ftp",
            "simplereport.name",
            "/fuzz"));
    _service.logGraphQlEvent(
        state,
        List.of(),
        userInfo.getWrapped(),
        userInfo.getPermissions(),
        userInfo.getIsAdmin(),
        userInfo.getOrganization().orElse(null));
    assertEquals(1L, _service.countAuditEvents());
    ApiAuditEvent saved = _service.getLastEvents(1).get(0);
    assertEquals("ABCDE", saved.getRequestId());
    assertEquals("ftp", saved.getHttpRequestDetails().getForwardedProtocol());
    assertEquals("A", saved.getGraphqlQueryDetails().getOperationName());
    assertEquals(
        List.of(
                UserPermission.SEARCH_PATIENTS,
                UserPermission.START_TEST,
                UserPermission.SUBMIT_TEST,
                UserPermission.UPDATE_TEST)
            .stream()
            .map(Enum::name)
            .collect(Collectors.toList()),
        saved.getUserPermissions());
  }

  @Test
  void anonymousRequestAuditSaved() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    _service.logAnonymousRestEvent("abc", request, HttpStatus.OK.value());
    assertEquals(1L, _service.countAuditEvents());
  }
}
