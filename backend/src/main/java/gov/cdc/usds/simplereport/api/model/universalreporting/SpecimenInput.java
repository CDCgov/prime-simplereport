package gov.cdc.usds.simplereport.api.model.universalreporting;

import jakarta.validation.constraints.NotNull;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SpecimenInput {
  private final String snomedTypeCode;
  private final String snomedDisplay;
  @NotNull private final Date collectionDate;
  private final Date receivedDate;
  private final String collectionBodySiteName;
  private final String collectionBodySiteCode;
}
