package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;

import com.fasterxml.jackson.core.JsonProcessingException;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.ConsoleApiAuditEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.GraphQlInputs;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import gov.cdc.usds.simplereport.logging.GraphqlQueryState;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportEntryOnlyUser;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

class AuditServiceTest extends BaseServiceTest<AuditService> {

  @Autowired private ApiUserService _userService;
  @MockitoBean AuditLoggerService auditLoggerServiceSpy;
  @Captor private ArgumentCaptor<ConsoleApiAuditEvent> auditLogCaptor;

  @Test
  @WithSimpleReportEntryOnlyUser
  void smokeTestGraphqlAudit() throws JsonProcessingException {
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

    verify(auditLoggerServiceSpy, atLeastOnce()).logEvent(auditLogCaptor.capture());
    ConsoleApiAuditEvent saved = auditLogCaptor.getValue();

    assertEquals(1L, auditLogCaptor.getAllValues().size());
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

    verify(auditLoggerServiceSpy, atLeastOnce()).logEvent(auditLogCaptor.capture());
    assertEquals(1L, auditLogCaptor.getAllValues().size());
  }
}
