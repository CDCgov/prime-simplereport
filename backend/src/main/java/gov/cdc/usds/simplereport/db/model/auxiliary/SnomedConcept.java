package gov.cdc.usds.simplereport.db.model.auxiliary;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SnomedConcept {
  private String name;
  private String code;
  private TestResult displayName;
}
