package gov.cdc.usds.simplereport.service.model;

import lombok.Builder;

@Builder
public class TimezoneInfo {
  public String timezoneCommonName;
  public int utcOffset;
  public boolean obeysDaylightSavings;
}
