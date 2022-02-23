package gov.cdc.usds.simplereport.api.model;

import java.util.UUID;
import lombok.Getter;

@Getter
public class ReportStreamCallbackRequest {
  private UUID testEventInternalId;
  private Boolean isError;
  private String details;
}
