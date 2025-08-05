package gov.cdc.usds.simplereport.api.model.universalreporting;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class TestDetailsInput {
  private final String condition;
  @NotNull private final String testOrderLoinc;
  private final String testOrderDisplayName;
  @NotNull private final String testPerformedLoinc;
  private final String testPerformedLoincLongCommonName;
  @NotNull private final ResultScaleType resultType;
  @NotBlank private final String resultValue;
  @NotNull private final Date resultDate;
  private final String resultInterpretation;
  private final String correctionStatus;
}
