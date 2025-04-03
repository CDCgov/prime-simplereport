package gov.cdc.usds.simplereport.api.model.universalreporting;

import java.util.Date;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TestDetailsInput {
  private String condition;
  private String testOrderLoinc;
  private String testPerformedLoinc;
  private String testPerformedLoincLongCommonName;
  private ResultScaleType resultType;
  private String resultValue;
  private Date resultDate;
  private String resultInterpretation;
}
