package gov.cdc.usds.simplereport.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.ConsoleApiAuditEvent;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import gov.cdc.usds.simplereport.logging.GraphqlQueryState;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
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
  private final ApiUserService _userService;
  private final AuditLoggerService auditLoggerService;

  public AuditService(ApiUserService userService, AuditLoggerService auditLoggerService) {
    this._userService = userService;
    this.auditLoggerService = auditLoggerService;
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
    auditLoggerService.logEvent(
        new ConsoleApiAuditEvent(
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
    auditLoggerService.logEvent(
        new ConsoleApiAuditEvent(requestId, reqDetails, responseCode, userInfo, org, patientLink));
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
    auditLoggerService.logEvent(
        new ConsoleApiAuditEvent(requestId, reqDetails, responseCode, userId, anonymousUser));
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
    auditLoggerService.logEvent(
        new ConsoleApiAuditEvent(requestId, reqDetails, responseCode, userId, webhookUser));
  }
}
