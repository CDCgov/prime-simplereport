package gov.cdc.usds.simplereport.service;

import ch.qos.logback.classic.Logger;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.ApiAuditEvent;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.ConsoleApiAuditEvent;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import gov.cdc.usds.simplereport.db.repository.ApiAuditEventRepository;
import gov.cdc.usds.simplereport.logging.GraphqlQueryState;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
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
public class AuditService {

  public static final int MAX_EVENT_FETCH = 10;

  private final ApiAuditEventRepository _repo;
  private final ApiUserService _userService;
  private final ObjectMapper objectMapper;
  private final Logger jsonLogger;

  public AuditService(
      ApiAuditEventRepository repo,
      ApiUserService userService,
      ObjectMapper objectMapper,
      Logger jsonLogger) {
    this._repo = repo;
    this._userService = userService;
    this.objectMapper = objectMapper;
    this.jsonLogger = jsonLogger;
  }

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
    logEvent(
        new ConsoleApiAuditEvent(
            state.getRequestId(),
            state.getHttpDetails(),
            state.getGraphqlDetails(),
            errorPaths,
            user,
            permissions,
            isAdmin,
            organization));
    _repo.save(
        new ApiAuditEvent(
            state.getRequestId(),
            state.getHttpDetails(),
            state.getGraphqlDetails(),
            errorPaths,
            user,
            permissions,
            isAdmin,
            organization));
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
    logEvent(
        new ConsoleApiAuditEvent(requestId, reqDetails, responseCode, userInfo, org, patientLink));
    _repo.save(new ApiAuditEvent(requestId, reqDetails, responseCode, userInfo, org, patientLink));
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
    logEvent(new ConsoleApiAuditEvent(requestId, reqDetails, responseCode, userId, anonymousUser));
    _repo.save(new ApiAuditEvent(requestId, reqDetails, responseCode, userId, anonymousUser));
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
    logEvent(new ConsoleApiAuditEvent(requestId, reqDetails, responseCode, userId, webhookUser));
    _repo.save(new ApiAuditEvent(requestId, reqDetails, responseCode, userId, webhookUser));
  }

  public void logEvent(ConsoleApiAuditEvent apiAuditEvent) {
    try {
      String auditJson = objectMapper.writeValueAsString(apiAuditEvent);
      jsonLogger.info(auditJson);
    } catch (JsonProcessingException e) {
      log.info("error transforming to json {}", e.toString());
    }
  }
}
