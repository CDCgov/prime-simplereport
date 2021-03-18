package gov.cdc.usds.simplereport.logging;

import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.service.AuditService;
import java.util.UUID;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

/**
 * HandlerInterceptor to set a request ID for patient experience REST handlers, as well as logging
 * audit information for patient requests.
 */
@Component
@ConditionalOnWebApplication
public class PatientExperienceLoggingInterceptor implements HandlerInterceptor {

  private static final Logger LOG =
      LoggerFactory.getLogger(PatientExperienceLoggingInterceptor.class);

  @Autowired private CurrentPatientContextHolder _context;
  @Autowired private AuditService _auditService;

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
      throws Exception {
    LOG.debug(
        "Pre-handling a method={} request for uri={} using handler={}",
        request.getMethod(),
        request.getRequestURI(),
        handler);
    String requestId = UUID.randomUUID().toString();
    MDC.put(GraphQLLoggingHelpers.GRAPHQL_QUERY_MDC_KEY, requestId);
    return true;
  }

  @Override
  public void postHandle(
      HttpServletRequest request,
      HttpServletResponse response,
      Object handler,
      ModelAndView modelAndView)
      throws Exception {
    PatientLink patientLink = _context.getPatientLink();
    LOG.debug("Closing out request. Patient link is {}", patientLink);
    if (patientLink != null) { // this is noooot acceptable
      String requestId = MDC.get(GraphQLLoggingHelpers.GRAPHQL_QUERY_MDC_KEY);
      _auditService.logRestEvent(requestId, request, _context.getOrganization(), patientLink);
    }
  }

  @Override
  public void afterCompletion(
      HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
      throws Exception {
    MDC.remove(GraphQLLoggingHelpers.GRAPHQL_QUERY_MDC_KEY);
  }
}
