package gov.cdc.usds.simplereport.api.model;

import lombok.Getter;

@Getter
public class ReportStreamCallbackRequest {
  private Boolean isError;
  private String message;
}
