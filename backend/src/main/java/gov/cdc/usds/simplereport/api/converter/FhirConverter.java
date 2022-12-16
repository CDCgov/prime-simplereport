package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.MappingConstants.RACE_CODING_SYSTEM;
import static gov.cdc.usds.simplereport.api.MappingConstants.RACE_EXTENSION_URL;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat;
import gov.cdc.usds.simplereport.api.MappingConstants;
import gov.cdc.usds.simplereport.db.model.PersonUtils;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.apache.commons.lang3.StringUtils;
import org.hl7.fhir.r4.model.Address;
import org.hl7.fhir.r4.model.CodeableConcept;
import org.hl7.fhir.r4.model.ContactPoint;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointUse;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
import org.hl7.fhir.r4.model.Extension;
import org.hl7.fhir.r4.model.HumanName;
import org.hl7.fhir.r4.model.Identifier;
import org.hl7.fhir.r4.model.Identifier.IdentifierUse;

public class FhirConverter {
  public static Identifier convertToIdentifier(UUID id) {
    if (id != null) {
      return convertToIdentifier(id.toString());
    }
    return null;
  }

  public static Identifier convertToIdentifier(String id) {
    if (id != null) {
      return new Identifier().setValue(id).setUse(IdentifierUse.USUAL);
    }
    return null;
  }

  public static HumanName convertToHumanName(PersonName personName) {
    if (personName != null) {
      return convertToHumanName(
          personName.getFirstName(),
          personName.getMiddleName(),
          personName.getLastName(),
          personName.getSuffix());
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

  public static ContactPoint phoneNumberToContactPoint(
      ContactPointUse contactPointUse, String number) {
    // converting string to phone format as recommended by the fhir format.
    // https://www.hl7.org/fhir/datatypes.html#ContactPoint
    try {
      var phoneUtil = PhoneNumberUtil.getInstance();
      var parsedNumber = phoneUtil.parse(number, "US");
      var formattedWithDash = phoneUtil.format(parsedNumber, PhoneNumberFormat.NATIONAL);

      number = formattedWithDash.replace("-", " ");
    } catch (NumberParseException ignored) {
    }

    return convertToContactPoint(contactPointUse, ContactPointSystem.PHONE, number);
  }

  public static ContactPoint convertToContactPoint(
      ContactPointUse use, ContactPointSystem system, String value) {
    if (value != null) {
      return new ContactPoint().setUse(use).setSystem(system).setValue(value);
    }
    return null;
  }

  public static AdministrativeGender convertToAdministrativeGender(String gender) {
    if ("male".equalsIgnoreCase(gender) || "m".equalsIgnoreCase(gender)) {
      return AdministrativeGender.MALE;
    } else if ("female".equalsIgnoreCase(gender) || "f".equalsIgnoreCase(gender)) {
      return AdministrativeGender.FEMALE;
    } else {
      return AdministrativeGender.UNKNOWN;
    }
  }

  public static Date convertToDate(LocalDate date) {
    if (date != null) {
      return Date.from(date.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }
    return null;
  }

  public static Address convertToAddress(
      List<String> street, String city, String county, String state, String postalCode) {
    var address =
        new Address().setCity(city).setDistrict(county).setState(state).setPostalCode(postalCode);
    if (street != null) {
      street.forEach(address::addLine);
    }
    return address;
  }

  public static Extension convertToRaceExtension(String race) {
    if (StringUtils.isNotBlank(race)) {
      var ext = new Extension();
      ext.setUrl(RACE_EXTENSION_URL);
      var codeable = new CodeableConcept();
      var coding = codeable.addCoding();
      if (PersonUtils.raceMap.containsKey(race)) {
        if (MappingConstants.UNKNOWN_STRING.equalsIgnoreCase(race)
            || "refused".equalsIgnoreCase(race)) {
          coding.setSystem(MappingConstants.NULL_CODE_SYSTEM);
        } else {
          coding.setSystem(RACE_CODING_SYSTEM);
        }
        coding.setCode(PersonUtils.raceMap.get(race));
        codeable.setText(race);
      } else {
        coding.setSystem(MappingConstants.NULL_CODE_SYSTEM);
        coding.setCode(MappingConstants.UNK_CODE);
        codeable.setText(MappingConstants.UNKNOWN_STRING);
      }
      ext.setValue(codeable);
      return ext;
    }
    return null;
  }
}
