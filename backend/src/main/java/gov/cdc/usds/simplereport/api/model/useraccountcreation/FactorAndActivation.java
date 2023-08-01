package gov.cdc.usds.simplereport.api.model.useraccountcreation;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FactorAndActivation {
  private String factorId;

  private Map<String, Object> activation;
}
