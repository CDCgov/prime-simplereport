package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.ApiAuditEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.GraphQlInputs;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import gov.cdc.usds.simplereport.logging.GraphqlQueryState;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportEntryOnlyUser;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class AuditServiceTest extends BaseServiceTest<AuditService> {

  @Test
  @WithSimpleReportEntryOnlyUser
  void smokeTestGraphqlAudit() {
    initSampleData(); // need to have the org exist
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
    _service.logGraphQlEvent(state, List.of());
    assertEquals(1L, _service.countAuditEvents());
    ApiAuditEvent saved = _service.getLastEvent().orElseThrow();
    assertEquals("ABCDE", saved.getRequestId());
    assertEquals("ftp", saved.getHttpRequestDetails().getForwardedProtocol());
    assertEquals("A", saved.getGraphqlQueryDetails().getOperationName());
    assertEquals(
        List.of(
            UserPermission.SEARCH_PATIENTS,
            UserPermission.START_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SUBMIT_TEST),
        saved.getUserPermissions());
  }
}
