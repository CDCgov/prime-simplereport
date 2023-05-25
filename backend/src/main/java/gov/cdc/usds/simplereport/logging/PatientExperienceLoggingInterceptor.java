package gov.cdc.usds.simplereport.logging;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import java.util.NoSuchElementException;
import java.util.UUID;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

/** HandlerInterceptor to set a request ID for patient experience REST handlers. */
@Component
@ConditionalOnWebApplication
@AllArgsConstructor
@Slf4j
public class PatientExperienceLoggingInterceptor implements HandlerInterceptor {

  private final ApiUserService apiUserService;
  private final OrganizationService organizationService;

  @Override
  public boolean preHandle(
      HttpServletRequest request, HttpServletResponse response, Object handler) {
    log.trace(
        "Pre-handling a method={} request for uri={} using handler={}",
        request.getMethod(),
        sanitizeRequestURI(request.getRequestURI()),
        handler);
    Organization org = null;
    UserInfo userInfo = null;
    try {
      org = organizationService.getCurrentOrganization();
      userInfo = apiUserService.getCurrentUserInfo();
    } catch (NoSuchElementException e) {
      // account for rest endpoints that are hit without okta info
      log.debug("Exception getting additional logging context.", e);
    }
    var orgId = org != null ? org.getInternalId().toString() : "";
    var userEmail = userInfo != null ? userInfo.getEmail() : "";
    var requestId = UUID.randomUUID().toString();

    MDC.put(LoggingConstants.REQUEST_ID_MDC_KEY, requestId);
    MDC.put(LoggingConstants.ORGANIZATION_ID_MDC_KEY, orgId);
    MDC.put(LoggingConstants.USER_MDC_KEY, userEmail);
    response.addHeader(LoggingConstants.REQUEST_ID_HEADER, requestId);
    return true;
  }

  @Override
  public void postHandle(
      HttpServletRequest request,
      HttpServletResponse response,
      Object handler,
      ModelAndView modelAndView)
      throws Exception {
    // this turns out not to be a place where we can modify the response status in case of failures,
    // so we had to move that service call somewhere else (currently, RestAuditLogManager, which is
    // called through a @PostAuthorize annotation, but this comment may not be kept up to date)
  }

  @Override
  public void afterCompletion(
      HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
      throws Exception {
    log.trace("Final logging cleanup step.");
    MDC.remove(LoggingConstants.REQUEST_ID_MDC_KEY);
    MDC.remove(LoggingConstants.ORGANIZATION_ID_MDC_KEY);
    MDC.remove(LoggingConstants.USER_MDC_KEY);
  }

  private String sanitizeRequestURI(String requestURI) {
    return requestURI.matches("\\w*") ? requestURI : "request contained invalid characters";
  }
}
