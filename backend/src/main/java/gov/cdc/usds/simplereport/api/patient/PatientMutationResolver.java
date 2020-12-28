package gov.cdc.usds.simplereport.api.patient;

import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumber;
import static gov.cdc.usds.simplereport.api.Translators.parseUserDate;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.api.model.Patient;
import gov.cdc.usds.simplereport.service.PersonService;
import graphql.kickstart.tools.GraphQLMutationResolver;

/**
 * Mutations for creating and updating patient records.
 */
@Component
public class PatientMutationResolver implements GraphQLMutationResolver  {

    private final PersonService _ps;
  
    public PatientMutationResolver(PersonService ps) {
        _ps = ps;
    }

    public void addPatient(
        String facilityId,
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
      LocalDate localBirthDateDate = parseUserDate(birthDate);
      _ps.addPatient(
            facilityId == null ? null : UUID.fromString(facilityId),
            lookupId,
            firstName,
            middleName,
            lastName,
            suffix,
            localBirthDateDate,
            street,
            street2,
            city,
            state,
            zipCode,
            parsePhoneNumber(telephone),
            role,
            email,
            county,
            race,
            ethnicity,
            gender,
            residentCongregateSetting,
            employedInHealthcare
        );
    }

    public void updatePatient(
      String facilityId,
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
      LocalDate localBirthDateDate = parseUserDate(birthDate);
      _ps.updatePatient(
          facilityId == null ? null : UUID.fromString(facilityId),
          patientId,
          lookupId,
          firstName,
          middleName,
          lastName,
          suffix,
          localBirthDateDate,
          street,
          street2,
          city,
          state,
          zipCode,
          parsePhoneNumber(telephone),
          role,
          email,
          county,
          race,
          ethnicity,
          gender,
          residentCongregateSetting,
          employedInHealthcare
      );
  }

  public Patient setPatientIsDeleted(UUID id, Boolean deleted) {
    return new Patient(_ps.setIsDeleted(id, deleted));
  }
}
