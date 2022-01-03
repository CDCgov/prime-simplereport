package gov.cdc.usds.simplereport.api.patient;

import static gov.cdc.usds.simplereport.api.Translators.parseEmails;
import static gov.cdc.usds.simplereport.api.Translators.parseEthnicity;
import static gov.cdc.usds.simplereport.api.Translators.parseGender;
import static gov.cdc.usds.simplereport.api.Translators.parsePersonRole;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumber;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumbers;
import static gov.cdc.usds.simplereport.api.Translators.parseRace;
import static gov.cdc.usds.simplereport.api.Translators.parseState;
import static gov.cdc.usds.simplereport.api.Translators.parseString;
import static gov.cdc.usds.simplereport.api.Translators.parseTribalAffiliation;

import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneNumberInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.UploadService;
import gov.cdc.usds.simplereport.service.model.PatientEmailsHolder;
import graphql.kickstart.tools.GraphQLMutationResolver;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import javax.servlet.http.Part;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/** Mutations for creating and updating patient records. */
@Component
@Slf4j
public class PatientMutationResolver implements GraphQLMutationResolver {
  private final PersonService _ps;
  private final UploadService _us;

  public PatientMutationResolver(PersonService ps, UploadService us) {
    _ps = ps;
    _us = us;
  }

  public String uploadPatients(Part part) {
    try (InputStream people = part.getInputStream()) {
      return _us.processPersonCSV(people);
    } catch (IllegalGraphqlArgumentException e) {
      throw e;
    } catch (IOException e) {
      log.error("Patient CSV upload failed", e);
      throw new CsvProcessingException("Unable to complete patient CSV upload");
    }
  }

  public Person addPatient(
      UUID facilityId,
      String lookupId,
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      LocalDate birthDate,
      String street,
      String street2,
      String city,
      String state,
      String zipCode,
      String telephone,
      List<PhoneNumberInput> phoneNumbers,
      String role,
      String email,
      List<String> emails,
      String county,
      String country,
      String race,
      String ethnicity,
      String tribalAffiliation,
      String gender,
      Boolean residentCongregateSetting,
      Boolean employedInHealthcare,
      String preferredLanguage,
      TestResultDeliveryPreference testResultDelivery) {
    List<PhoneNumberInput> backwardsCompatiblePhoneNumbers =
        phoneNumbers != null
            ? phoneNumbers
            : List.of(new PhoneNumberInput(null, parsePhoneNumber(telephone)));

    var backwardsCompatibleEmails = new PatientEmailsHolder(email, emails);

    return _ps.addPatient(
        facilityId,
        parseString(lookupId),
        parseString(firstName),
        parseString(middleName),
        parseString(lastName),
        parseString(suffix),
        birthDate,
        new StreetAddress(
            parseString(street),
            parseString(street2),
            parseString(city),
            parseState(state),
            parseString(zipCode),
            parseString(county)),
        parseString(country),
        parsePhoneNumbers(backwardsCompatiblePhoneNumbers),
        parsePersonRole(role, false),
        parseEmails(backwardsCompatibleEmails.getFullList()),
        parseRace(race),
        parseEthnicity(ethnicity),
        parseTribalAffiliation(tribalAffiliation),
        parseGender(gender),
        residentCongregateSetting,
        employedInHealthcare,
        parseString(preferredLanguage),
        testResultDelivery);
  }

  public Person updatePatient(
      UUID facilityId,
      UUID patientId,
      String lookupId,
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      LocalDate birthDate,
      String street,
      String street2,
      String city,
      String state,
      String zipCode,
      String telephone,
      List<PhoneNumberInput> phoneNumbers,
      String role,
      String email,
      List<String> emails,
      String county,
      String country,
      String race,
      String ethnicity,
      String tribalAffiliation,
      String gender,
      Boolean residentCongregateSetting,
      Boolean employedInHealthcare,
      String preferredLanguage,
      TestResultDeliveryPreference testResultDelivery) {
    List<PhoneNumberInput> backwardsCompatiblePhoneNumbers =
        phoneNumbers != null
            ? phoneNumbers
            : List.of(new PhoneNumberInput(null, parsePhoneNumber(telephone)));

    var backwardsCompatibleEmails = new PatientEmailsHolder(email, emails);

    return _ps.updatePatient(
        facilityId,
        patientId,
        parseString(lookupId),
        parseString(firstName),
        parseString(middleName),
        parseString(lastName),
        parseString(suffix),
        birthDate,
        new StreetAddress(
            parseString(street),
            parseString(street2),
            parseString(city),
            parseState(state),
            parseString(zipCode),
            parseString(county)),
        parseString(country),
        parsePhoneNumbers(backwardsCompatiblePhoneNumbers),
        parsePersonRole(role, false),
        parseEmails(backwardsCompatibleEmails.getFullList()),
        parseRace(race),
        parseEthnicity(ethnicity),
        parseTribalAffiliation(tribalAffiliation),
        parseGender(gender),
        residentCongregateSetting,
        employedInHealthcare,
        parseString(preferredLanguage),
        testResultDelivery);
  }

  public Person setPatientIsDeleted(UUID id, Boolean deleted) {
    return _ps.setIsDeleted(id, deleted);
  }
}
