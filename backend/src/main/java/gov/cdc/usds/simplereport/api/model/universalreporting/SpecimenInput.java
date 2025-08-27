package gov.cdc.usds.simplereport.api.model.universalreporting;

import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NonNull;

@Getter
@AllArgsConstructor
@Builder
public class SpecimenInput {
  @NonNull private final String snomedTypeCode;
  private final String snomedDisplay;
  @NonNull private final Date collectionDate;
  @NonNull private final Date receivedDate;
  private final String collectionBodySiteName;
  private final String collectionBodySiteCode;
}
