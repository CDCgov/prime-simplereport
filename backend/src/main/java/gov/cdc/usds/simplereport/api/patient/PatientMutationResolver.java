package gov.cdc.usds.simplereport.api.patient;

import static gov.cdc.usds.simplereport.api.Translators.parseUserDate;

import java.time.LocalDate;

import org.springframework.stereotype.Component;

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
            telephone,
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
          telephone,
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
}