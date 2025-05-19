package gov.cdc.usds.simplereport.api.model.universalreporting;

import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TestDetailsInput {
  private final String condition;
  private final String testOrderLoinc;
  private final String testPerformedLoinc;
  private final String testPerformedLoincLongCommonName;
  private final ResultScaleType resultType;
  private final String resultValue;
  private final Date resultDate;
  private final String resultInterpretation;
}
