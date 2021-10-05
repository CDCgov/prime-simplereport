package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.ReportStreamResponse;
import gov.cdc.usds.simplereport.db.repository.ReportStreamResponseRepository;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Slf4j
public class ConfiguredReportStreamCallbackService implements ReportStreamCallbackService {
  private static final String TOKEN_HEADER = "x-functions-key";
  private final String apiToken;
  private final ReportStreamResponseRepository reportStreamResponseRepository;

  @Override
  public boolean validateCallback(HttpServletRequest request) {
    if (apiToken.equals(request.getHeader(TOKEN_HEADER))) {
      return true;
    }
    log.error("Bad token provided");
    return false;
  }

  @Override
  public void log(ReportStreamResponse response) {
    reportStreamResponseRepository.save(response);
  }
}
