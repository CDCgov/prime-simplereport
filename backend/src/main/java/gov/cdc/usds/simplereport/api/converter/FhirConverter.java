package gov.cdc.usds.simplereport.api.converter;

import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
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

  public static HumanName convertToHumanName(PersonName name) {
    if (name != null) {
      var humanName = new HumanName();
      if (StringUtils.isNotBlank(name.getFirstName())) {
        humanName.addGiven(name.getFirstName());
      }
      if (StringUtils.isNotBlank(name.getMiddleName())) {
        humanName.addGiven(name.getMiddleName());
      }
      if (StringUtils.isNotBlank(name.getLastName())) {
        humanName.setFamily(name.getLastName());
      }
      if (StringUtils.isNotBlank(name.getSuffix())) {
        humanName.addSuffix(name.getSuffix());
      }
      return humanName;
    }
    return null;
  }
}
