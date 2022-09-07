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
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.MultipartFile;

/** Mutations for creating and updating patient records. */
@Controller
@Slf4j
public class PatientMutationResolver {
  private final PersonService _ps;
  private final UploadService _us;

  public PatientMutationResolver(PersonService ps, UploadService us) {
    _ps = ps;
    _us = us;
  }

  @MutationMapping
  public String uploadPatients(@Argument MultipartFile patientList) {
    try (InputStream people = patientList.getInputStream()) {
      return _us.processPersonCSV(people);
    } catch (IllegalGraphqlArgumentException e) {
      throw e;
    } catch (IOException e) {
      log.error("Patient CSV upload failed", e);
      throw new CsvProcessingException("Unable to complete patient CSV upload");
    }
  }

  @MutationMapping
  public Person addPatient(
      @Argument UUID facilityId,
      @Argument String lookupId,
      @Argument String firstName,
      @Argument String middleName,
      @Argument String lastName,
      @Argument String suffix,
      @Argument LocalDate birthDate,
      @Argument String street,
      @Argument String street2,
      @Argument String city,
      @Argument String state,
      @Argument String zipCode,
      @Argument String telephone,
      @Argument List<PhoneNumberInput> phoneNumbers,
      @Argument String role,
      @Argument String email,
      @Argument List<String> emails,
      @Argument String county,
      @Argument String country,
      @Argument String race,
      @Argument String ethnicity,
      @Argument String tribalAffiliation,
      @Argument String gender,
      @Argument Boolean residentCongregateSetting,
      @Argument Boolean employedInHealthcare,
      @Argument String preferredLanguage,
      @Argument TestResultDeliveryPreference testResultDelivery) {
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

  @MutationMapping
  public Person updatePatient(
      @Argument UUID facilityId,
      @Argument UUID patientId,
      @Argument String lookupId,
      @Argument String firstName,
      @Argument String middleName,
      @Argument String lastName,
      @Argument String suffix,
      @Argument LocalDate birthDate,
      @Argument String street,
      @Argument String streetTwo,
      @Argument String city,
      @Argument String state,
      @Argument String zipCode,
      @Argument String telephone,
      @Argument List<PhoneNumberInput> phoneNumbers,
      @Argument String role,
      @Argument String email,
      @Argument List<String> emails,
      @Argument String county,
      @Argument String country,
      @Argument String race,
      @Argument String ethnicity,
      @Argument String tribalAffiliation,
      @Argument String gender,
      @Argument Boolean residentCongregateSetting,
      @Argument Boolean employedInHealthcare,
      @Argument String preferredLanguage,
      @Argument TestResultDeliveryPreference testResultDelivery) {
    List<PhoneNumberInput> backwardsCompatiblePhoneNumbers =
        phoneNumbers != null
            ? phoneNumbers
            : List.of(new PhoneNumberInput(null, parsePhoneNumber(telephone)));

    var backwardsCompatibleEmails = new PatientEmailsHolder(email, emails);

    Person person =
        _ps.updatePatient(
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
                parseString(streetTwo),
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
    return person;
  }

  @MutationMapping
  public Person setPatientIsDeleted(@Argument UUID id, @Argument Boolean deleted) {
    Person person = _ps.setIsDeleted(id, deleted);
    return person;
  }
}
