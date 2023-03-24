package gov.cdc.usds.simplereport.db.model.auxiliary;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SnomedConcept {
  public String name;
  public String code;
  public TestResult displayName;
}
