package gov.cdc.usds.simplereport.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.ConsoleApiAuditEvent;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import gov.cdc.usds.simplereport.logging.GraphqlQueryState;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

/** Service for recording API access events that must be made available for audits. */
@Service
@Transactional(readOnly = true)
@Validated
@Slf4j
public class AuditService {
  private static final String FIELD_USER_ID = "userId";
  private final ApiUserService _userService;
  private final AuditLoggerService auditLoggerService;

  public AuditService(ApiUserService userService, AuditLoggerService auditLoggerService) {
    this._userService = userService;
    this.auditLoggerService = auditLoggerService;
  }

  private void createEventAuditLog(String requestId) {
    log.trace("Saving audit event for {}", requestId);
  }

  @Transactional(readOnly = false)
  public void logGraphQlEvent(
      GraphqlQueryState state,
      List<String> errorPaths,
      ApiUser user,
      List<UserPermission> permissions,
      boolean isAdmin,
      Organization organization) {
    createEventAuditLog(state.getRequestId());
    auditLoggerService.logEvent(
        new ConsoleApiAuditEvent(
            state.getRequestId(),
            state.getHttpDetails(),
            state.getGraphqlDetails().getOperationName(),
            errorPaths,
            user,
            permissions,
            isAdmin,
            organization));
  }

  @Transactional(readOnly = false)
  public void logRestEvent(
      String requestId, HttpServletRequest request, int responseCode, Organization org) {
    createEventAuditLog(requestId);
    HttpRequestDetails reqDetails = new HttpRequestDetails(request);
    ApiUser userInfo = _userService.getCurrentApiUserInContainedTransaction();
    auditLoggerService.logEvent(
        new ConsoleApiAuditEvent(requestId, reqDetails, responseCode, userInfo, org));
  }

  @Transactional(readOnly = false)
  public void logAnonymousRestEvent(
      String requestId, HttpServletRequest request, int responseCode) {
    createEventAuditLog(requestId);
    HttpRequestDetails reqDetails = new HttpRequestDetails(request);
    Object userIdObj = request.getSession(true).getAttribute(FIELD_USER_ID);
    JsonNode userId =
        (userIdObj == null)
            ? null
            : JsonNodeFactory.instance.objectNode().put(FIELD_USER_ID, userIdObj.toString());
    ApiUser anonymousUser = _userService.getAnonymousApiUser();
    auditLoggerService.logEvent(
        new ConsoleApiAuditEvent(requestId, reqDetails, responseCode, userId, anonymousUser));
  }

  @Transactional(readOnly = false)
  public void logWebhookRestEvent(String requestId, HttpServletRequest request, int responseCode) {
    log.trace("Saving webhook REST audit event for {}", requestId);
    HttpRequestDetails reqDetails = new HttpRequestDetails(request);
    Object userIdObj = request.getSession(true).getAttribute(FIELD_USER_ID);
    JsonNode userId =
        (userIdObj == null)
            ? null
            : JsonNodeFactory.instance.objectNode().put(FIELD_USER_ID, userIdObj.toString());
    ApiUser webhookUser = _userService.getWebhookApiUser();
    auditLoggerService.logEvent(
        new ConsoleApiAuditEvent(requestId, reqDetails, responseCode, userId, webhookUser));
  }
}
