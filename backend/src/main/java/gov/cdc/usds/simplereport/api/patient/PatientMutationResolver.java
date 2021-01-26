package gov.cdc.usds.simplereport.api.patient;

import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumber;
import static gov.cdc.usds.simplereport.api.Translators.parseUserDate;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.UUID;
import javax.servlet.http.Part;

import org.springframework.stereotype.Component;

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

    public String uploadPatients(Part part) throws Exception {
        InputStream people = part.getInputStream();
        return _us.processPersonCSV(people);
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

  public Person setPatientIsDeleted(UUID id, Boolean deleted) {
    return _ps.setIsDeleted(id, deleted);
  }
}
