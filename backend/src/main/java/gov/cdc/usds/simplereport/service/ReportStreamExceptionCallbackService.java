package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.ReportStreamException;
import javax.servlet.http.HttpServletRequest;

public interface ReportStreamExceptionCallbackService {
  boolean validateCallback(HttpServletRequest request);

  void log(ReportStreamException exception);
}
