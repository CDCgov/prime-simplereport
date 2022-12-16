package gov.cdc.usds.simplereport.api.converter;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.hl7.fhir.r4.model.Address;
import org.hl7.fhir.r4.model.ContactPoint;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointUse;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
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
}
