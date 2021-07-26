package gov.cdc.usds.simplereport.service;

import com.fasterxml.jackson.databind.JsonNode;
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
import org.hibernate.validator.constraints.Range;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

/** Service for recording API access events that must be made available for audits. */
@Service
@Transactional(readOnly = true)
@Validated
public class AuditService {

  private static final Logger LOG = LoggerFactory.getLogger(AuditService.class);
  public static final int MAX_EVENT_FETCH = 10;

  private final ApiAuditEventRepository _repo;
  private final ApiUserService _userService;

  public AuditService(ApiAuditEventRepository repo, ApiUserService userService) {
    this._repo = repo;
    this._userService = userService;
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
    LOG.trace("Saving audit event for {}", state.getRequestId());
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
    LOG.trace("Saving audit event for {}", requestId);
    HttpRequestDetails reqDetails = new HttpRequestDetails(request);
    ApiUser userInfo = _userService.getCurrentApiUserInContainedTransaction();
    _repo.save(new ApiAuditEvent(requestId, reqDetails, responseCode, userInfo, org, patientLink));
  }

  @Transactional(readOnly = false)
  public void logAnonymousRestEvent(
      String requestId, HttpServletRequest request, int responseCode) {
    LOG.trace("Saving audit event for {}", requestId);
    HttpRequestDetails reqDetails = new HttpRequestDetails(request);
    Object userIdObj = request.getSession(true).getAttribute("userId");
    JsonNode userId =
        (userIdObj == null)
            ? null
            : JsonNodeFactory.instance.objectNode().put("userId", userIdObj.toString());
    ApiUser anonymousUser = _userService.getAnonymousApiUser();
    _repo.save(new ApiAuditEvent(requestId, reqDetails, responseCode, userId, anonymousUser));
  }
}
