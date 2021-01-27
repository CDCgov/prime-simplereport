package gov.cdc.usds.simplereport.api.patient;

import static gov.cdc.usds.simplereport.api.Translators.parseEmail;
import static gov.cdc.usds.simplereport.api.Translators.parseEthnicity;
import static gov.cdc.usds.simplereport.api.Translators.parseGender;
import static gov.cdc.usds.simplereport.api.Translators.parsePersonRole;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumber;
import static gov.cdc.usds.simplereport.api.Translators.parseRace;
import static gov.cdc.usds.simplereport.api.Translators.parseState;
import static gov.cdc.usds.simplereport.api.Translators.parseString;
import static gov.cdc.usds.simplereport.api.Translators.parseUserDate;

import java.io.InputStream;
import java.util.UUID;
import javax.servlet.http.Part;

import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.UploadService;
import graphql.kickstart.tools.GraphQLMutationResolver;

/**
 * Mutations for creating and updating patient records.
 */
@Component
public class PatientMutationResolver implements GraphQLMutationResolver  {

    private final PersonService _ps;
    private final UploadService _us;

    public PatientMutationResolver(PersonService ps, UploadService us) {
        _ps = ps;
        _us = us;
    }

    @AuthorizationConfiguration.RequireGlobalAdminUser
    public String uploadPatients(Part part) throws Exception {
        InputStream people = part.getInputStream();
        return _us.processPersonCSV(people);
    }

    public void addPatient(
        UUID facilityId,
        String lookupId,
        String firstName,
        String middleName,
        String lastName,
        String suffix,
        String birthDate,
        String street,
        String street2,
        String city,
        String state,
        String zipCode,
        String telephone,
        String role,
        String email,
        String county,
        String race,
        String ethnicity,
        String gender,
        Boolean residentCongregateSetting,
        Boolean employedInHealthcare
    ) {
      _ps.addPatient(
            facilityId,
            parseString(lookupId),
            parseString(firstName),
            parseString(middleName),
            parseString(lastName),
            parseString(suffix),
            parseUserDate(birthDate),
            parseString(street),
            parseString(street2),
            parseString(city),
            parseState(state),
            parseString(zipCode),
            parsePhoneNumber(telephone),
            parsePersonRole(role),
            parseEmail(email),
            parseString(county),
            parseRace(race),
            parseEthnicity(ethnicity),
            parseGender(gender),
            residentCongregateSetting,
            employedInHealthcare
        );
    }

    public void updatePatient(
      UUID facilityId,
      String patientId,
      String lookupId,
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      String birthDate,
      String street,
      String street2,
      String city,
      String state,
      String zipCode,
      String telephone,
      String role,
      String email,
      String county,
      String race,
      String ethnicity,
      String gender,
      Boolean residentCongregateSetting,
      Boolean employedInHealthcare
  ) {
      _ps.updatePatient(
          facilityId,
          patientId,
          parseString(lookupId),
          parseString(firstName),
          parseString(middleName),
          parseString(lastName),
          parseString(suffix),
          parseUserDate(birthDate),
          parseString(street),
          parseString(street2),
          parseString(city),
          parseState(state),
          parseString(zipCode),
          parsePhoneNumber(telephone),
          parsePersonRole(role),
          parseEmail(email),
          parseString(county),
          parseRace(race),
          parseEthnicity(ethnicity),
          parseGender(gender),
          residentCongregateSetting,
          employedInHealthcare
      );
  }

  public Person setPatientIsDeleted(UUID id, Boolean deleted) {
    return _ps.setIsDeleted(id, deleted);
  }
}
