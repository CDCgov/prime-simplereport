package gov.cdc.usds.simplereport.api.converter;

import org.apache.commons.lang3.StringUtils;
import org.hl7.fhir.r4.model.HumanName;
import org.hl7.fhir.r4.model.Identifier;
import org.hl7.fhir.r4.model.Identifier.IdentifierUse;

public class FhirConverter {
  public static Identifier convertToIdentifier(String id) {
    if (id != null) {
      return new Identifier().setValue(id).setUse(IdentifierUse.USUAL);
    }
    return null;
  }

  public static HumanName convertToHumanName(
      String first, String middle, String last, String suffix) {
    var humanName = new HumanName();
    if (StringUtils.isNotBlank(first)) {
      humanName.addGiven(first);
    }
    if (StringUtils.isNotBlank(middle)) {
      humanName.addGiven(middle);
    }
    if (StringUtils.isNotBlank(last)) {
      humanName.setFamily(last);
    }
    if (StringUtils.isNotBlank(suffix)) {
      humanName.addSuffix(suffix);
    }
    return humanName;
  }
}
