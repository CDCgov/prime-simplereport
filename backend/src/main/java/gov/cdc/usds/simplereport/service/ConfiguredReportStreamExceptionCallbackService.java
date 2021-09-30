package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.ReportStreamException;
import gov.cdc.usds.simplereport.db.repository.ReportStreamExceptionRepository;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Slf4j
public class ConfiguredReportStreamExceptionCallbackService
    implements ReportStreamExceptionCallbackService {
  private final String TOKEN_HEADER = "x-functions-key";
  private final String apiToken;
  private final ReportStreamExceptionRepository reportStreamExceptionRepository;

  @Override
  public boolean validateCallback(HttpServletRequest request) {
    if (request.getHeader(TOKEN_HEADER).equals(apiToken)) {
      return true;
    }
    log.error("Bad token provided: {}", request.getHeader(TOKEN_HEADER));
    return false;
  }

  @Override
  public void log(ReportStreamException exception) {
    reportStreamExceptionRepository.save(exception);
  }
}
