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
    super();
    this._auditService = auditService;
    this._contextHolder = contextHolder;
  }

  public boolean logRestSuccess(HttpServletRequest request, Object resultObject) {
    PatientLink patientLink = _contextHolder.getPatientLink();
    if (patientLink == null) {
      LOG.error("Somehow reached PXP success handler with no patient link");
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
}
