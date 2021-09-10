package gov.cdc.usds.simplereport.api.model;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.api.graphql.BaseGraphqlTest;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.TestEventService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;

// added enable_lazy_load_no_trans=true because I couldn't figure out how to make the hibernate
// session work within a test that also tests our API
@TestPropertySource(
    properties = {
      "hibernate.query.interceptor.error-level=ERROR",
      "spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"
    })
@WithSimpleReportStandardUser
class TestEventExportIntegrationTest extends BaseGraphqlTest {
  @Autowired protected TestDataFactory _dataFactory;
  @Autowired private TestEventService _testEventService;
  @Autowired private OrganizationService _orgService;
  @MockBean private CurrentTenantDataAccessContextHolder _tenantDataAccessContextHolder;

  TestEventExport testEventExport;

  @BeforeEach
  void initData() {
    Organization organization = _orgService.getCurrentOrganizationNoCache();
    Facility facility = _orgService.getFacilities(organization).get(0);
    Person patient = _dataFactory.createFullPerson(organization);
    _dataFactory.createTestOrder(patient, facility);
    ObjectNode variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("deviceId", _dataFactory.getGenericDevice().getInternalId().toString())
            .put("patientId", patient.getInternalId().toString())
            .put("result", TestResult.NEGATIVE.toString())
            .put("dateTested", "2021-09-01T10:31:30.001Z");
    submitTestResult(variables, Optional.empty());
    TestEvent testEvent = _testEventService.getLastTestResultsForPatient(patient);
    testEventExport = new TestEventExport(testEvent);
  }

  @Test
  void testEventSerialization() throws Exception {
    assertEquals("Fred", testEventExport.getOrderingProviderFirstName());
  }

  private JsonNode submitTestResult(ObjectNode variables, Optional<String> expectedError) {
    return runQuery("add-test-result-mutation", variables, expectedError.orElse(null));
  }
}
