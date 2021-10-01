package gov.cdc.usds.simplereport.api.model;

import java.util.UUID;
import lombok.Data;

@Data
public class ReportStreamCallbackRequest {
  private final UUID testEventInternalId;
  private final Boolean isError;
  private final String details;
}
