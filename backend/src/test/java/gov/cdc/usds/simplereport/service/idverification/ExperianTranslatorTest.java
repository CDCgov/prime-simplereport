package gov.cdc.usds.simplereport.service.idverification;

import static gov.cdc.usds.simplereport.service.idverification.ExperianTranslator.createInitialRequestBody;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationRequest;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.Test;

class ExperianTranslatorTest {

  private static final String FIRST_NAME = "Jane";
  private static final String LAST_NAME = "Doe";
  private static final String MIDDLE_NAME = "M";
  private static final String DOB = "1980-03-21";
  private static final String EMAIL = "jane@example.com";
  private static final String PHONE = "410-867-4309";
  private static final String STREET_ADDRESS = "1600 Pennsylvania Ave SE";
  private static final String CITY = "Washington";
  private static final String STATE = "DC";
  private static final String ZIP_CODE = "20500";

  // positive tests

  @Test
  void requestBody_worksWithValidInput() throws Exception {
    IdentityVerificationRequest userData = createValidUserData();
    String requestBody = createRequest(userData);

    JSONObject requestJson = new JSONObject(requestBody);
    assertThat(requestJson.has("payload")).isTrue();
    assertThat(requestJson.has("header")).isTrue();

    JSONObject payloadBody = requestJson.getJSONObject("payload");
    assertThat(payloadBody.has("control")).isTrue();
    assertThat(payloadBody.has("contacts")).isTrue();

    JSONArray contactArray = payloadBody.getJSONArray("contacts");
    assertThat(contactArray.length()).isEqualTo(1);

    JSONObject firstEntry = contactArray.getJSONObject(0);
    JSONObject person = firstEntry.getJSONObject("person");
    // names are as expected
    assertThat(person.getJSONArray("names").getJSONObject(0).getString("firstName"))
        .isEqualTo(FIRST_NAME);
    assertThat(person.getJSONArray("names").getJSONObject(0).getString("surName"))
        .isEqualTo(LAST_NAME);
    assertThat(person.getJSONArray("names").getJSONObject(0).getString("middleNames"))
        .isEqualTo(MIDDLE_NAME);

    // dob matches
    assertThat(person.getJSONObject("personDetails").getString("dateOfBirth")).isEqualTo(DOB);

    // contact information matches
    JSONObject address = firstEntry.getJSONArray("addresses").getJSONObject(0);
    assertThat(address.getString("street")).isEqualTo(STREET_ADDRESS);
    assertThat(address.getString("postTown")).isEqualTo(CITY);
    assertThat(address.getString("postal")).isEqualTo(ZIP_CODE);
    assertThat(address.getString("stateProvinceCode")).isEqualTo(STATE);

    // email matches
    assertThat(firstEntry.getJSONArray("emails").getJSONObject(0).getString("email"))
        .isEqualTo(EMAIL);

    // phone number matches
    assertThat(firstEntry.getJSONArray("telephones").getJSONObject(0).getString("number"))
        .isEqualTo(PHONE);
  }

  void createRequest_successfulWithoutOptionalFields() throws Exception {
    IdentityVerificationRequest userData = createValidUserData();
    userData.setMiddleName(null);

    String requestBody = createRequest(userData);

    JSONObject requestJson = new JSONObject(requestBody);
    assertThat(requestJson.has("payload")).isTrue();
    // other names still present
    assertThat(
            requestJson
                .getJSONObject("payload")
                .getJSONArray("contacts")
                .getJSONObject(0)
                .getJSONObject("person")
                .getJSONArray("names")
                .getJSONObject(0)
                .getString("firstName"))
        .isEqualTo(FIRST_NAME);
  }

  // negative tests

  @Test
  void createRequest_failsWithoutRequiredData() {
    IdentityVerificationRequest userData = createValidUserData();
    userData.setFirstName(null);
    Exception exception =
        assertThrows(
            IllegalArgumentException.class,
            () -> {
              createRequest(userData);
            });
    assertThat(exception).hasMessageContaining("String is required and cannot be empty.");
  }

  @Test
  void createRequest_failsWithInvalidDate() {
    IdentityVerificationRequest userData = createValidUserData();
    userData.setDateOfBirth("180-12-03");
    Exception exception =
        assertThrows(
            IllegalArgumentException.class,
            () -> {
              createRequest(userData);
            });
    assertThat(exception).hasMessageContaining("Date was not properly formatted");
  }

  @Test
  void createRequest_failsWithInvalidDateFormat() {
    IdentityVerificationRequest userData = createValidUserData();
    userData.setDateOfBirth("1980/12/12");
    Exception exception =
        assertThrows(
            IllegalArgumentException.class,
            () -> {
              createRequest(userData);
            });
    assertThat(exception).hasMessageContaining("Date was not properly formatted");
  }

  // helpers

  private IdentityVerificationRequest createValidUserData() {
    IdentityVerificationRequest request = new IdentityVerificationRequest();
    request.setFirstName(FIRST_NAME);
    request.setLastName(LAST_NAME);
    request.setMiddleName(MIDDLE_NAME);
    request.setDateOfBirth(DOB);
    request.setEmail(EMAIL);
    request.setPhoneNumber(PHONE);
    request.setStreetAddress1(STREET_ADDRESS);
    request.setCity(CITY);
    request.setState(STATE);
    request.setZip(ZIP_CODE);
    return request;
  }

  private String createRequest(IdentityVerificationRequest userData) {
    return createInitialRequestBody(
        "username", "password", userData, "tenantId", "clientReferenceId");
  }
}
