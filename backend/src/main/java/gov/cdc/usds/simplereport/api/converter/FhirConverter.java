package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ETHNICITY_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ETHNICITY_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.NULL_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.RACE_CODING_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.RACE_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.TRIBAL_AFFILIATION_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.TRIBAL_AFFILIATION_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.TRIBAL_AFFILIATION_STRING;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat;
import gov.cdc.usds.simplereport.api.MappingConstants;
import gov.cdc.usds.simplereport.db.model.PersonUtils;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.hl7.fhir.r4.model.Address;
import org.hl7.fhir.r4.model.CodeableConcept;
import org.hl7.fhir.r4.model.Coding;
import org.hl7.fhir.r4.model.ContactPoint;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointUse;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
import org.hl7.fhir.r4.model.Extension;
import org.hl7.fhir.r4.model.HumanName;
import org.hl7.fhir.r4.model.Identifier;
import org.hl7.fhir.r4.model.Identifier.IdentifierUse;
import org.hl7.fhir.r4.model.ServiceRequest;
import org.hl7.fhir.r4.model.ServiceRequest.ServiceRequestIntent;
import org.hl7.fhir.r4.model.ServiceRequest.ServiceRequestStatus;
import org.hl7.fhir.r4.model.StringType;

@Slf4j
public class FhirConverter {
  private FhirConverter() {
    throw new IllegalStateException("Utility class");
  }

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

  public static List<ContactPoint> phoneNumberToContactPoint(List<PhoneNumber> phoneNumber) {
    if (phoneNumber != null && !phoneNumber.isEmpty()) {
      return phoneNumber.stream()
          .map(FhirConverter::phoneNumberToContactPoint)
          .collect(Collectors.toList());
    }
    return Collections.emptyList();
  }

  public static ContactPoint phoneNumberToContactPoint(PhoneNumber phoneNumber) {
    if (phoneNumber != null) {
      var contactPointUse = ContactPointUse.HOME;
      if (PhoneType.MOBILE.equals(phoneNumber.getType())) {
        contactPointUse = ContactPointUse.MOBILE;
      }

      return phoneNumberToContactPoint(contactPointUse, phoneNumber.getNumber());
    }
    return null;
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
    } catch (NumberParseException exception) {
      log.debug("Error parsing number: " + exception);
    }

    return convertToContactPoint(contactPointUse, ContactPointSystem.PHONE, number);
  }

  public static List<ContactPoint> emailToContactPoint(List<String> emails) {
    if (emails != null) {
      return emails.stream().map(FhirConverter::emailToContactPoint).collect(Collectors.toList());
    }
    return Collections.emptyList();
  }

  public static ContactPoint emailToContactPoint(String email) {
    if (email != null) {
      return convertToContactPoint(null, ContactPointSystem.EMAIL, email);
    }
    return null;
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

  public static Address convertToAddress(StreetAddress address) {
    if (address != null) {
      return convertToAddress(
          address.getStreet(),
          address.getCity(),
          address.getCounty(),
          address.getState(),
          address.getPostalCode());
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
          coding.setSystem(NULL_CODE_SYSTEM);
        } else {
          coding.setSystem(RACE_CODING_SYSTEM);
        }
        coding.setCode(PersonUtils.raceMap.get(race));
        codeable.setText(race);
      } else {
        coding.setSystem(NULL_CODE_SYSTEM);
        coding.setCode(MappingConstants.UNK_CODE);
        codeable.setText(MappingConstants.UNKNOWN_STRING);
      }
      ext.setValue(codeable);
      return ext;
    }
    return null;
  }

  public static Extension convertToEthnicityExtension(String ethnicity) {
    if (StringUtils.isNotBlank(ethnicity)) {
      var ext = new Extension();
      ext.setUrl(ETHNICITY_EXTENSION_URL);
      var ombExtension = ext.addExtension();
      ombExtension.setUrl("ombCategory");
      var ombCoding = new Coding();
      if (PersonUtils.ETHNICITY_MAP.containsKey(ethnicity)) {
        if ("refused".equalsIgnoreCase(ethnicity)) {
          ombCoding.setSystem(NULL_CODE_SYSTEM);
        } else {
          ombCoding.setSystem(ETHNICITY_CODE_SYSTEM);
        }
        ombCoding.setCode(PersonUtils.ETHNICITY_MAP.get(ethnicity).get(0));
        ombCoding.setDisplay(PersonUtils.ETHNICITY_MAP.get(ethnicity).get(1));

        var text = ext.addExtension();
        text.setUrl("text");
        text.setValue(new StringType(PersonUtils.ETHNICITY_MAP.get(ethnicity).get(1)));
      } else {
        ombCoding.setSystem(NULL_CODE_SYSTEM);
        ombCoding.setCode(MappingConstants.UNK_CODE);
        ombCoding.setDisplay(MappingConstants.UNKNOWN_STRING);

        var text = ext.addExtension();
        text.setUrl("text");
        text.setValue(new StringType(MappingConstants.UNKNOWN_STRING));
      }
      ombExtension.setValue(ombCoding);
      return ext;
    }
    return null;
  }

  public static Extension convertToTribalAffiliationExtension(List<String> tribalAffiliations) {
    if (tribalAffiliations != null && !tribalAffiliations.isEmpty()) {
      return convertToTribalAffiliationExtension(tribalAffiliations.get(0));
    }
    return null;
  }

  public static Extension convertToTribalAffiliationExtension(String tribalAffiliation) {
    if (StringUtils.isNotBlank(tribalAffiliation)
        && PersonUtils.tribalMap().containsKey(tribalAffiliation)) {
      var ext = new Extension();
      ext.setUrl(TRIBAL_AFFILIATION_EXTENSION_URL);
      var tribeExtension = ext.addExtension();
      tribeExtension.setUrl(TRIBAL_AFFILIATION_STRING);
      var tribeCodeableConcept = new CodeableConcept();
      var tribeCoding = tribeCodeableConcept.addCoding();
      tribeCoding.setSystem(TRIBAL_AFFILIATION_CODE_SYSTEM);
      tribeCoding.setCode(tribalAffiliation);
      tribeCoding.setDisplay(PersonUtils.tribalMap().get(tribalAffiliation));
      tribeCodeableConcept.setText(PersonUtils.tribalMap().get(tribalAffiliation));
      tribeExtension.setValue(tribeCodeableConcept);
      return ext;
    }
    return null;
  }

  public static ServiceRequest convertToServiceRequest(TestOrder order) {
    if (order != null) {
      var serviceRequest = new ServiceRequest();
      serviceRequest.setIntent(ServiceRequestIntent.ORDER);
      switch (order.getOrderStatus()) {
        case PENDING:
          serviceRequest.setStatus(ServiceRequestStatus.ACTIVE);
          break;
        case COMPLETED:
          serviceRequest.setStatus(ServiceRequestStatus.COMPLETED);
          break;
        case CANCELED:
          serviceRequest.setStatus(ServiceRequestStatus.REVOKED);
          break;
      }

      if (order.getDeviceType() != null) {
        serviceRequest
            .getCode()
            .addCoding()
            .setSystem(LOINC_CODE_SYSTEM)
            .setCode(order.getDeviceType().getLoincCode());
      }

      return serviceRequest;
    }
    return null;
  }
}
