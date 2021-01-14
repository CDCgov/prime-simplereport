package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.text.SimpleDateFormat;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.DeviceType;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;

@SuppressWarnings("checkstyle:MagicNumber")
public class TestResultTest extends BaseApiTest {

    @Autowired
    private TestDataFactory _dataFactory;
    @Autowired
    private OrganizationService _orgService;

    private Organization _org;
    private Facility _site;

    @BeforeEach
    public void init() {
        _org = _orgService.getCurrentOrganization();
        _site = _orgService.getFacilities(_org).get(0);
    }

    @Test
    public void fetchTestResults() throws Exception {
        Person p = _dataFactory.createFullPerson(_org);
        _dataFactory.createTestEvent(p, _site);
        _dataFactory.createTestEvent(p, _site);
        _dataFactory.createTestEvent(p, _site);
  
        ObjectNode variables = getFacilityScopedArguments();
        ArrayNode testResults = fetchTestResults(variables);

        assertEquals(3, testResults.size());
    }

    private ObjectNode getFacilityScopedArguments() {
        return JsonNodeFactory.instance.objectNode()
                .put("facilityId", _site.getInternalId().toString());
    }

    private ArrayNode fetchTestResults(ObjectNode variables) {
        return (ArrayNode) runQuery("test-result-query", variables).get("testResults");
    }

    // TODO: THIS DOESN'T WORK
    @Test
    public void submitTestResult() throws Exception {
        Person p = _dataFactory.createFullPerson(_org);
        DeviceType d = _dataFactory.getGenericDevice();
        TestEvent te = _dataFactory.createTestEvent(p, _site);

        String dateTested = "2020-12-31T14:30:30.000Z";
        // SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
  
        ObjectNode variables = JsonNodeFactory.instance.objectNode()
            .put("deviceId", d.getInternalId().toString())
            .put("patientId", p.getInternalId().toString())
            .put("result", TestResult.NEGATIVE.toString())
            .put("dateTested", dateTested);
        
        submitTestResult(variables);
        ArrayNode testResults = fetchTestResults(getFacilityScopedArguments());
        assertEquals(testResults.size(), 1);
    }

    private ObjectNode submitTestResult(ObjectNode variables) {
        return runQuery("add-test-result-mutation", variables);
    }

}
