package gov.cdc.usds.simplereport.api.converter;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ConditionAgnosticConvertToPatientProps {
  private String id;
  private String firstName;
  private String lastName;
  private String nameAbsentReason;
  private String gender;
}
