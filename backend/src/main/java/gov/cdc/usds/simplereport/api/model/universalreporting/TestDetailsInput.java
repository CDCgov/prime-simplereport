package gov.cdc.usds.simplereport.api.model.universalreporting;

import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NonNull;

@Getter
@AllArgsConstructor
@Builder
public class TestDetailsInput {
  private final String condition;
  @NonNull private final String testOrderLoinc;
  private final String testOrderDisplayName;
  @NonNull private final String testPerformedLoinc;
  private final String testPerformedLoincLongCommonName;
  @NonNull private final ResultScaleType resultType;
  @NonNull private final String resultValue;
  @NonNull private final Date resultDate;
  private final String resultInterpretation;
  private final String correctionStatus;
}
