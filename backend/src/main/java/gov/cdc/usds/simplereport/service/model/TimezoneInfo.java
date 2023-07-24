package gov.cdc.usds.simplereport.service.model;

import lombok.Builder;

@Builder
public class TimezoneInfo {
  public final String timezoneCommonName;
  public final int utcOffset;
  public final boolean obeysDaylightSavings;
}
