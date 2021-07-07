package gov.cdc.usds.simplereport.service.idVerification;

import static gov.cdc.usds.simplereport.service.idVerification.ExperianTranslator.createInitialRequestBody;

import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationRequest;
import gov.cdc.usds.simplereport.properties.ExperianProperties;
import java.util.UUID;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

public class LiveExperianService implements ExperianService {

  private final ExperianProperties _experianProperties;
  private RestTemplate _restTemplate;

  @Autowired
  public LiveExperianService(final ExperianProperties experianProperties) {
    _experianProperties = experianProperties;
    _restTemplate = new RestTemplate();
  }

  public String fetchToken() {
    String guid = UUID.randomUUID().toString();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.add("X-Correlation-Id", guid);
    headers.add("X-User-Domain", _experianProperties.getDomain());

    JSONObject requestBody = new JSONObject();
    requestBody.put(
        "username", _experianProperties.getUsername() + "@" + _experianProperties.getDomain());
    requestBody.put("password", _experianProperties.getPassword());
    requestBody.put("client_id", _experianProperties.getClientId());
    requestBody.put("client_secret", _experianProperties.getClientSecret());
    HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);
    try {
      JSONObject response =
          _restTemplate.postForObject(
              _experianProperties.getTokenEndpoint(), entity, JSONObject.class);
      return response.getString("access_token");
    } catch (RestClientException | NullPointerException e) {
      throw new IllegalArgumentException("The activation token could not be retrieved: ", e);
    }
  }

  public void getQuestions(IdentityVerificationRequest userData) {
    System.out.println("in the live version");
    String initialRequestBody =
        createInitialRequestBody(
            _experianProperties.getUsername(),
            _experianProperties.getPassword(),
            userData,
            "fakeTenantId",
            "fakeClientReferenceId");
    System.out.println(initialRequestBody);
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.add("Authorization: Bearer", fetchToken());
    HttpEntity<String> entity = new HttpEntity<>(initialRequestBody, headers);
    try {
    JSONObject response = _restTemplate.postForObject(_experianProperties.getIntialRequestEndpoint(), entity, JSONObject.class);
    // next: unwrap the response and get the questions
    } catch (RestClientException | NullPointerException e) {
      throw new IllegalStateException("Questions could not be retrieved from Experian", e);
    }
  }
}
