package gov.cdc.usds.simplereport.service;

import ch.qos.logback.classic.Logger;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.ApiAuditEvent;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import gov.cdc.usds.simplereport.db.repository.ApiAuditEventRepository;
import gov.cdc.usds.simplereport.logging.GraphqlQueryState;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.validator.constraints.Range;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

/** Service for recording API access events that must be made available for audits. */
@Service
@Transactional(readOnly = true)
@Validated
@Slf4j
@RequiredArgsConstructor
public class AuditService {

  public static final int MAX_EVENT_FETCH = 10;

  private final Logger jsonLogger;
  private final ApiAuditEventRepository _repo;
  private final ApiUserService _userService;
  private final ObjectMapper objectMapper;

  public List<ApiAuditEvent> getLastEvents(@Range(min = 1, max = MAX_EVENT_FETCH) int count) {
    List<ApiAuditEvent> events = _repo.findFirst10ByOrderByEventTimestampDesc();
    return count <= events.size() ? events.subList(0, count) : events;
  }

  public long countAuditEvents() {
    return _repo.count();
  }

  @Transactional(readOnly = false)
  public void logGraphQlEvent(
      GraphqlQueryState state,
      List<String> errorPaths,
      ApiUser user,
      List<UserPermission> permissions,
      boolean isAdmin,
      Organization organization) {
    log.trace("Saving audit event for {}", state.getRequestId());
    ApiAuditEvent apiAuditEvent =
        new ApiAuditEvent(
            state.getRequestId(),
            state.getHttpDetails(),
            state.getGraphqlDetails(),
            errorPaths,
            user,
            permissions,
            isAdmin,
            organization);
    _repo.save(apiAuditEvent);
    logEvent(apiAuditEvent);
  }

  @Transactional(readOnly = false)
  public void logRestEvent(
      String requestId,
      HttpServletRequest request,
      int responseCode,
      Organization org,
      PatientLink patientLink) {
    log.trace("Saving audit event for {}", requestId);
    HttpRequestDetails reqDetails = new HttpRequestDetails(request);
    ApiUser userInfo = _userService.getCurrentApiUserInContainedTransaction();
    ApiAuditEvent apiAuditEvent =
        new ApiAuditEvent(requestId, reqDetails, responseCode, userInfo, org, patientLink);
    _repo.save(apiAuditEvent);
    logEvent(apiAuditEvent);
  }

  @Transactional(readOnly = false)
  public void logAnonymousRestEvent(
      String requestId, HttpServletRequest request, int responseCode) {
    log.trace("Saving audit event for {}", requestId);
    HttpRequestDetails reqDetails = new HttpRequestDetails(request);
    Object userIdObj = request.getSession(true).getAttribute("userId");
    JsonNode userId =
        (userIdObj == null)
            ? null
            : JsonNodeFactory.instance.objectNode().put("userId", userIdObj.toString());
    ApiUser anonymousUser = _userService.getAnonymousApiUser();
    ApiAuditEvent apiAuditEvent =
        new ApiAuditEvent(requestId, reqDetails, responseCode, userId, anonymousUser);
    _repo.save(apiAuditEvent);
    logEvent(apiAuditEvent);
  }

  @Transactional(readOnly = false)
  public void logWebhookRestEvent(String requestId, HttpServletRequest request, int responseCode) {
    log.trace("Saving webhook REST audit event for {}", requestId);
    HttpRequestDetails reqDetails = new HttpRequestDetails(request);
    Object userIdObj = request.getSession(true).getAttribute("userId");
    JsonNode userId =
        (userIdObj == null)
            ? null
            : JsonNodeFactory.instance.objectNode().put("userId", userIdObj.toString());
    ApiUser webhookUser = _userService.getWebhookApiUser();
    ApiAuditEvent apiAuditEvent =
        new ApiAuditEvent(requestId, reqDetails, responseCode, userId, webhookUser);
    _repo.save(apiAuditEvent);
    logEvent(apiAuditEvent);
  }

  public void logEvent(ApiAuditEvent apiAuditEvent) {
    try {
      jsonLogger.info(objectMapper.writeValueAsString(apiAuditEvent));
    } catch (JsonProcessingException e) {
      log.info("error transforming to json {}", e.toString());
    }
  }
}
