package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.IOException;
import java.text.SimpleDateFormat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.TestOrderService;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;

public class QueueManagementTest extends BaseApiTest {

    private static final String QUERY = "queue-dates-query";

    @Autowired
    private TestDataFactory _dataFactory;
    @Autowired
    private OrganizationService _orgService;
    @Autowired
    private TestOrderService _testOrderService;

    private Organization _org;
    private Facility _site;

    @BeforeEach
    public void init() {
        _org = _orgService.getCurrentOrganization();
        _site = _orgService.getFacilities(_org).get(0);
    }

    @Test
    public void enqueueOnePatient() throws Exception {
        Person p = _dataFactory.createFullPerson(_org);
        String personId = p.getInternalId().toString();
        ObjectNode variables = getFacilityScopedArguments()
                .put("id", personId)
                .put("previousTestDate", "05/15/2020")
                .put("symptomOnsetDate", "11/30/2020");
        performEnqueueMutation(variables);
        ArrayNode queueData = fetchQueue();
        assertEquals(1, queueData.size());
        JsonNode queueEntry = queueData.get(0);
        String symptomOnset = queueEntry.get("symptomOnset").asText();
        String priorTest = queueEntry.get("priorTestDate").asText();
        assertEquals("2020-11-30", symptomOnset);
        assertEquals("2020-05-15", priorTest);
        // this assertion is kind of extra, should be on a patient management
        // test instead
        assertEquals("1899-05-10", queueEntry.get("patient").get("birthDate").asText());
    }

    @Test
    public void updateItemInQueue() throws Exception {
        Person p = _dataFactory.createFullPerson(_org);
        TestOrder o = _dataFactory.createTestOrder(p, _site);
        String orderId = o.getInternalId().toString();
        DeviceType d = _dataFactory.getGenericDevice();
        String deviceId = d.getInternalId().toString();
        String dateTested = "2020-12-31T14:30:30.000Z";
        ObjectNode variables = JsonNodeFactory.instance.objectNode()
                .put("id", orderId)
                .put("deviceId", deviceId)
                .put("result", TestResult.POSITIVE.toString())
                .put("dateTested", dateTested);

        performQueueUpdateMutation(variables);

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        TestOrder updatedTestOrder = _testOrderService.getTestOrder(orderId);
        assertEquals(updatedTestOrder.getDeviceType().getInternalId().toString(), deviceId);
        assertEquals(updatedTestOrder.getTestResult(), TestResult.POSITIVE);
        assertEquals(updatedTestOrder.getTestEvent(), null);
        assertEquals(sdf.format(updatedTestOrder.getDateTested()), dateTested);
    }

    @Test
    public void enqueueOnePatientIsoDate() throws Exception {
        Person p = _dataFactory.createFullPerson(_org);
        String personId = p.getInternalId().toString();
        ObjectNode variables = getFacilityScopedArguments()
                .put("id", personId)
                .put("previousTestDate", "2020-05-15")
                .put("symptomOnsetDate", "2020-11-30");
        performEnqueueMutation(variables);
        ArrayNode queueData = fetchQueue();
        assertEquals(1, queueData.size());
        JsonNode queueEntry = queueData.get(0);
        String symptomOnset = queueEntry.get("symptomOnset").asText();
        String priorTest = queueEntry.get("priorTestDate").asText();
        assertEquals("2020-11-30", symptomOnset);
        assertEquals("2020-05-15", priorTest);
    }

    private ObjectNode getFacilityScopedArguments() {
        return JsonNodeFactory.instance.objectNode()
                .put("facilityId", _site.getInternalId().toString());
    }

    private ArrayNode fetchQueue() {
        return (ArrayNode) runQuery(QUERY, getFacilityScopedArguments()).get("queue");
    }

    private void performEnqueueMutation(ObjectNode variables) throws IOException {
        assertGraphQLSuccess(_template.perform("add-to-queue", variables));
    }

    private void performQueueUpdateMutation(ObjectNode variables) throws IOException {
        assertGraphQLSuccess(_template.perform("edit-queue-item", variables));
    }
}
