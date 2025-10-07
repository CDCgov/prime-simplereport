package gov.cdc.usds.simplereport.service.idverification;

import static gov.cdc.usds.simplereport.service.idverification.ExperianTranslator.createInitialRequestBody;
import static gov.cdc.usds.simplereport.service.idverification.ExperianTranslator.createSubmitAnswersRequestBody;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationAnswersRequest;
import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationAnswersResponse;
import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationQuestionsRequest;
import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationQuestionsResponse;
import gov.cdc.usds.simplereport.properties.ExperianProperties;
import gov.cdc.usds.simplereport.service.errors.ExperianAuthException;
import gov.cdc.usds.simplereport.service.errors.ExperianGetQuestionsException;
import gov.cdc.usds.simplereport.service.errors.ExperianKbaResultException;
import gov.cdc.usds.simplereport.service.errors.ExperianNullNodeException;
import gov.cdc.usds.simplereport.service.errors.ExperianPersonMatchException;
import gov.cdc.usds.simplereport.service.errors.ExperianSubmitAnswersException;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

@Service
@ConditionalOnProperty("simple-report.experian.enabled")
@Slf4j
public class LiveExperianService
    implements gov.cdc.usds.simplereport.service.idverification.ExperianService {

  private static final String KBA_RESULT_CODE_PATH =
      "/clientResponsePayload/decisionElements/0/otherData/json/fraudSolutions/response/products/preciseIDServer/kbascore/general/kbaresultCode";
  private static final String KBA_RESULT_CODE_DESCRIPTION_PATH =
      "/clientResponsePayload/decisionElements/0/otherData/json/fraudSolutions/response/products/preciseIDServer/kbascore/general/kbaresultCodeDescription";
  private static final String KBA_SESSION_ID_PATH =
      "/clientResponsePayload/decisionElements/0/otherData/json/fraudSolutions/response/products/preciseIDServer/kba/general/sessionID";
  private static final String KBA_QUESTIONS_PATH =
      "/clientResponsePayload/decisionElements/0/otherData/json/fraudSolutions/response/products/preciseIDServer/kba/questionSet";
  private static final String PID_OVERALL_DECISION_PATH =
      "/responseHeader/overallResponse/decision";
  private static final String PID_FINAL_DECISION_PATH =
      "/clientResponsePayload/decisionElements/0/decisions/2/value";

  private static final int RETRY_SERVER_ERROR_CODE = 500;
  private static final int MAX_REFETCH_TRIES = 2;

  private static final String SUCCESS_DECISION = "ACCEPT";
  private static final String SUCCESS_DECISION_SHORT = "ACC";
  private static final int KBA_SUCCESS_RESULT_CODE = 0;
  private static final int KBA_PERSON_NOT_FOUND_RESULT_CODE = 9;

  private final ExperianProperties _experianProperties;
  private final ObjectMapper _objectMapper;

  private final RestTemplate _restTemplate;

  @Autowired
  public LiveExperianService(
      final ExperianProperties experianProperties, final ObjectMapper mapper) {
    _experianProperties = experianProperties;
    _objectMapper = mapper;
    _restTemplate = new RestTemplate();
  }

  public LiveExperianService(
      final ExperianProperties experianProperties,
      final ObjectMapper mapper,
      final RestTemplate restTemplate) {
    _experianProperties = experianProperties;
    _objectMapper = mapper;
    _restTemplate = restTemplate;
  }

  private String fetchToken() {
    String guid = UUID.randomUUID().toString();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.add("X-Correlation-Id", guid);
    headers.add("X-User-Domain", _experianProperties.getDomain());

    final JsonNodeFactory factory = JsonNodeFactory.instance;
    ObjectNode requestBody = factory.objectNode();
    requestBody.put("username", _experianProperties.getCrosscoreUsername());
    requestBody.put("password", _experianProperties.getCrosscorePassword());
    requestBody.put("client_id", _experianProperties.getClientId());
    requestBody.put("client_secret", _experianProperties.getClientSecret());

    HttpEntity<ObjectNode> entity = new HttpEntity<>(requestBody, headers);
    int retryOn500AuthCounter = 0;
    while (true) {
      try {
        ObjectNode responseBody =
            _restTemplate.postForObject(
                _experianProperties.getTokenEndpoint(), entity, ObjectNode.class);

        if (responseBody == null) {
          log.error("EXPERIAN TOKEN FETCH RETURNED NULL", requestBody);
          throw new ExperianAuthException("The Experian token request returned a null response.");
        }

        return responseBody.path("access_token").asText();
      } catch (RestClientResponseException e) {
        // Experian token fetching intermittently throws 500 errors that resolve themselves on
        // retry.
        // For more details:
        // https://github.com/CDCgov/prime-simplereport/wiki/Alert-Response#prod-alert-when-an-experianauthexception-is-seen
        if (e.getRawStatusCode() == RETRY_SERVER_ERROR_CODE) {
          log.error("EXPERIAN TOKEN FETCH RETURNED 500 ERROR", e);

          if (retryOn500AuthCounter >= MAX_REFETCH_TRIES) {
            String description =
                String.format(
                    "The activation token could not be retrieved after %d attempts.",
                    MAX_REFETCH_TRIES);
            throw new ExperianAuthException(description, e);
          }
          retryOn500AuthCounter++;
        } else {
          throw new ExperianAuthException("The activation token could not be retrieved.", e);
        }
      }
    }
  }

  public IdentityVerificationQuestionsResponse getQuestions(
      IdentityVerificationQuestionsRequest userData) {
    try {
      ObjectNode initialRequestBody =
          createInitialRequestBody(
              _experianProperties.getCrosscoreSubscriberSubcode(),
              _experianProperties.getPreciseidUsername(),
              _experianProperties.getPreciseidPassword(),
              _experianProperties.getPreciseidTenantId(),
              _experianProperties.getPreciseidClientReferenceId(),
              userData);

      log.info("EXPERIAN_QUESTION_REQUEST_SUBMITTED");
      ObjectNode responseEntity = submitExperianRequest(initialRequestBody);

      // KIQ response may a kbaresultCode that indicates failure, this seems to only be present
      // in unsuccessful requests to get questions (consumer not found, deceased, etc.)
      JsonNode kbaResultCodeNode = responseEntity.at(KBA_RESULT_CODE_PATH);
      if (!kbaResultCodeNode.isMissingNode()) {
        handleKbaResultCodeFailure(kbaResultCodeNode.asInt(), responseEntity);
      }

      // return KIQ questions and session id
      JsonNode questionsDataNode = findNodeInResponse(responseEntity, KBA_QUESTIONS_PATH);
      String sessionId = findNodeInResponse(responseEntity, KBA_SESSION_ID_PATH).asText();

      return new IdentityVerificationQuestionsResponse(sessionId, questionsDataNode);
    } catch (RestClientException | JsonProcessingException e) {
      throw new ExperianGetQuestionsException("Questions could not be retrieved from Experian", e);
    }
  }

  public IdentityVerificationAnswersResponse submitAnswers(
      IdentityVerificationAnswersRequest answersRequest) {
    try {
      ObjectNode finalRequestBody =
          createSubmitAnswersRequestBody(
              _experianProperties.getCrosscoreSubscriberSubcode(),
              _experianProperties.getPreciseidUsername(),
              _experianProperties.getPreciseidPassword(),
              _experianProperties.getPreciseidTenantId(),
              _experianProperties.getPreciseidClientReferenceId(),
              answersRequest);
      log.info("EXPERIAN_ANSWER_REQUEST_SUBMITTED");
      ObjectNode responseEntity = submitExperianRequest(finalRequestBody);

      // look for errors in KIQ response ("CrossCore - PreciseId (Option 24).pdf" page 79)
      int kbaResultCode = findNodeInResponse(responseEntity, KBA_RESULT_CODE_PATH).asInt();
      if (kbaResultCode != KBA_SUCCESS_RESULT_CODE) {
        handleKbaResultCodeFailure(kbaResultCode, responseEntity);
      }

      boolean passed;
      try {
        // find overall decision ("CrossCore 2.x Technical Developer Guide.pdf" page 28-29)
        String decision = findNodeInResponse(responseEntity, PID_OVERALL_DECISION_PATH).textValue();
        // if experian responds with ACCEPT, we will consider the id verification successful
        passed = SUCCESS_DECISION.equals(decision);
      } catch (ExperianNullNodeException e) {
        // Experian does not always return the overall decision. If this happens, check for the
        // value of "final decision".
        String finalDecision =
            findNodeInResponse(responseEntity, PID_FINAL_DECISION_PATH).textValue();
        passed = SUCCESS_DECISION_SHORT.equals(finalDecision);
      }

      // Generate a searchable log message so we can monitor decisions from Experian
      String requestData = _objectMapper.writeValueAsString(answersRequest);
      log.info("EXPERIAN_DECISION ({}): {}", passed, requestData);

      return new IdentityVerificationAnswersResponse(passed);
    } catch (RestClientException | JsonProcessingException e) {
      throw new ExperianSubmitAnswersException("Answers could not be validated by Experian", e);
    }
  }

  private ObjectNode submitExperianRequest(ObjectNode requestBody) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBearerAuth(fetchToken());
    HttpEntity<ObjectNode> entity = new HttpEntity<>(requestBody, headers);
    ObjectNode responseBody =
        _restTemplate.postForObject(
            _experianProperties.getInitialRequestEndpoint(), entity, ObjectNode.class);
    if (responseBody == null) {
      throw new RestClientException("A request to Experian returned a null response.");
    }
    return responseBody;
  }

  // look for node at path and throw if nothing is found
  private JsonNode findNodeInResponse(final JsonNode responseEntity, final String path) {
    final JsonNode fetchedNode = responseEntity.at(path);
    if (fetchedNode.isMissingNode()) {
      log.error("EXPERIAN_NULL_NODE: {}", path);
      throw new ExperianNullNodeException("Could not find data in response from Experian");
    }
    return fetchedNode;
  }

  private void handleKbaResultCodeFailure(final int kbaResultCode, final JsonNode responseEntity) {
    String kbaResultCodeDescription =
        findNodeInResponse(responseEntity, KBA_RESULT_CODE_DESCRIPTION_PATH).asText();
    if (kbaResultCode == KBA_PERSON_NOT_FOUND_RESULT_CODE) {
      // specific code for consumer not found ("CrossCore - PreciseId (Option 24).pdf" page 89)
      throw new ExperianPersonMatchException(kbaResultCodeDescription);
    }

    // any other non-success result
    throw new ExperianKbaResultException(kbaResultCodeDescription);
  }
}
