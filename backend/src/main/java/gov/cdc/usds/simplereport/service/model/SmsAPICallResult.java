package gov.cdc.usds.simplereport.service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@AllArgsConstructor
@Builder
@Getter
public class SmsAPICallResult {
  private String telephone;
  private String messageId;
  private boolean successful;
}
