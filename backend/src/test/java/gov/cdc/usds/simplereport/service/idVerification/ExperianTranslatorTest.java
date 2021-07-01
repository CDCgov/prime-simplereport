package gov.cdc.usds.simplereport.service.idVerification;

import static org.assertj.core.api.Assertions.assertThat;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.Test;
import static gov.cdc.usds.simplereport.service.idVerification.ExperianTranslator.createInitialRequestBody;

import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationRequest;

class ExperianTranslatorTest {
    
    @Test
    void requestBody_worksWithValidInput() {
        IdentityVerificationRequest userData = createValidRequest();
        String requestBody = createInitialRequestBody("username", "password", userData, "tenantId", "clientReferenceId");
        
        JSONObject requestJson = new JSONObject(requestBody);
        assertThat(requestJson.has("payload")).isTrue();
        assertThat(requestJson.has("header")).isTrue();

        JSONObject payloadBody = requestJson.getJSONObject("payload");
        assertThat(payloadBody.has("control")).isTrue();
        assertThat(payloadBody.has("contacts")).isTrue();

        System.out.println(payloadBody);

        JSONArray contactBody = requestJson.getJSONArray("contacts");
        assertThat(contactBody.length()).isEqualTo(1);
        // assertThat(contactBody.has("names")).isTrue();

    }

    private IdentityVerificationRequest createValidRequest() {
        IdentityVerificationRequest request = new IdentityVerificationRequest();
        request.setFirstName("Jane");
        request.setLastName("Doe");
        request.setMiddleName("M");
        request.setDateOfBirth("1980-03-21");
        request.setEmail("jane@example.com");
        request.setPhoneNumber("410-867-5309");
        request.setStreetAddress1("1600 Pennsylvania Ave SE");
        request.setCity("Washington");
        request.setState("DC");
        request.setZip("20500");
        return request;
    }
}
