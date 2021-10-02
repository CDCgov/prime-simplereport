package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.ReportStreamResponse;
import javax.servlet.http.HttpServletRequest;

public interface ReportStreamCallbackService {
  boolean validateCallback(HttpServletRequest request);

  void log(ReportStreamResponse response);
}
