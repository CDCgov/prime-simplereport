package gov.cdc.usds.simplereport.logging;

import gov.cdc.usds.simplereport.api.CurrentUIVersionContextHolder;
import java.util.UUID;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

/** HandlerInterceptor to set a request ID for patient experience REST handlers. */
@Component
@ConditionalOnWebApplication
public class PatientExperienceLoggingInterceptor implements HandlerInterceptor {
  private final CurrentUIVersionContextHolder _currentUIVersionContextHolder;

  PatientExperienceLoggingInterceptor(CurrentUIVersionContextHolder currentUIVersionContextHolder) {
    _currentUIVersionContextHolder = currentUIVersionContextHolder;
  }

  private static final Logger LOG =
      LoggerFactory.getLogger(PatientExperienceLoggingInterceptor.class);

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
      throws Exception {
    LOG.trace(
        "Pre-handling a method={} request for uri={} using handler={}",
        request.getMethod(),
        request.getRequestURI(),
        handler);
    String requestId = UUID.randomUUID().toString();
    MDC.put(LoggingConstants.REQUEST_ID_MDC_KEY, requestId);
    response.addHeader(LoggingConstants.REQUEST_ID_HEADER, requestId);
    _currentUIVersionContextHolder.setUiShaFromHeaders(
        request.getHeader(LoggingConstants.UI_VERSION_HEADER));
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
    LOG.trace("Final logging cleanup step.");
    MDC.remove(LoggingConstants.REQUEST_ID_MDC_KEY);
  }
}
