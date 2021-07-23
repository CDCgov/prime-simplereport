package gov.cdc.usds.simplereport.logging;

import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.service.AuditService;
import gov.cdc.usds.simplereport.service.errors.RestAuditFailureException;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/** Wrapper around {@link AuditService} to catch exceptions and rethrow them */
@Service
// NOT TRANSACTIONAL (must catch errors at transaction boundaries)
@SuppressWarnings("checkstyle:IllegalCatch")
public class RestAuditLogManager {

  private static final Logger LOG = LoggerFactory.getLogger(RestAuditLogManager.class);

  private final AuditService _auditService;
  private final CurrentPatientContextHolder _contextHolder;

  private static final int DEFAULT_SUCCESS = HttpStatus.OK.value();

  public RestAuditLogManager(AuditService auditService, CurrentPatientContextHolder contextHolder) {
    this._auditService = auditService;
    this._contextHolder = contextHolder;
  }

  /**
   * To be called from a PostAuthorize annotation or otherwise at the end of request processing, but
   * before the response is actually handed back off to tomcat. Saves the audit log, or if it cannot
   * be saved throws an exception so that there is no response to the user about the action they
   * just attempted.
   *
   * @param request the {@link HttpServletRequest} that is being handled.
   * @param resultObject the object being returned by the controller method, presumably for Jackson
   *     converting to a JSON response body. Not currently used, to the annoyance of Sonar.
   * @return true if the request should be allowed to complete, false otherwise (in this case, only
   *     if we get to this but there is no patient link available, which indicates something wonky
   *     happened.).
   */
  public boolean logRestSuccess(HttpServletRequest request, Object resultObject) {
    PatientLink patientLink = _contextHolder.getPatientLink();
    if (patientLink == null && !_contextHolder.isPatientSelfRegistrationRequest()) {
      LOG.error(
          "Somehow reached PXP success handler outside of registration & with no patient link");
      return false;
    }
    try {
      String requestId = MDC.get(LoggingConstants.REQUEST_ID_MDC_KEY);
      Organization org = _contextHolder.getOrganization();
      _auditService.logRestEvent(requestId, request, DEFAULT_SUCCESS, org, patientLink);
    } catch (Exception e) {
      throw new RestAuditFailureException(e);
    }
    return true;
  }

  public boolean logAnonymousRestSuccess(HttpServletRequest request, Object returnObject) {
    try {
      String requestId = MDC.get(LoggingConstants.REQUEST_ID_MDC_KEY);
      _auditService.logAnonymousRestEvent(requestId, request, DEFAULT_SUCCESS);
    } catch (Exception e) {
      throw new RestAuditFailureException(e);
    }
    return true;
  }
}
