package gov.cdc.usds.simplereport.logging;

import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.service.AuditService;
import gov.cdc.usds.simplereport.service.errors.RestAuditFailureException;
import javax.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * This ControllerAdvice component monitors all of the REST handlers (<i>not</i> the GraphQL
 * servlet) for exceptions during execution. If one is thrown, it intercepts it, checks to see what
 * status code we will be returning when Spring handles the exception, logs an ApiAuditEvent with
 * that status (if there is an active PatientLink), and rethrows the exception.
 */
@ControllerAdvice
@Slf4j
public class AuditLoggingAdvice {

  private final AuditService _auditService;
  private final CurrentPatientContextHolder _contextHolder;

  public AuditLoggingAdvice(AuditService auditService, CurrentPatientContextHolder contextHolder) {
    this._auditService = auditService;
    this._contextHolder = contextHolder;
  }

  @ExceptionHandler
  public void logAndRethrow(HttpServletRequest request, Exception e) throws Exception {
    Class<? extends Exception> exceptionType = e.getClass();
    log.debug(
        "Checking for response status and patient link for exception of type={}", exceptionType);
    if (e instanceof RestAuditFailureException) {
      log.debug("Audit logging already failed: not trying again");
    } else if (_contextHolder.hasPatientLink()) {
      ResponseStatus responseStatus =
          AnnotationUtils.findAnnotation(exceptionType, ResponseStatus.class);
      int responseCode = HttpStatus.INTERNAL_SERVER_ERROR.value();
      if (responseStatus != null) {
        responseCode = responseStatus.code().value();
      }
      PatientLink patientLink = _contextHolder.getPatientLink();
      Organization org = _contextHolder.getOrganization();
      log.trace(
          "Saving audit entry for patientLinkId={}, organizationId={}",
          patientLink.getInternalId(),
          org.getInternalId());
      String requestId = MDC.get(LoggingConstants.REQUEST_ID_MDC_KEY);
      _auditService.logRestEvent(requestId, request, responseCode, org, patientLink);
    } else {
      log.trace("No patient link found: no audit entry needed");
    }
    throw e;
  }
}
