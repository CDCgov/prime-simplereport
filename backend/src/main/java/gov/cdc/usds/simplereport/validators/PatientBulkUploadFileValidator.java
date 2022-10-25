package gov.cdc.usds.simplereport.validators;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getNextRow;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateBiologicalSex;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateDate;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateEmail;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateEthnicity;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validatePhoneNumber;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validatePhoneNumberType;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateRace;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateRole;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateState;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateYesNoAnswer;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateZipCode;

import com.fasterxml.jackson.databind.MappingIterator;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class PatientBulkUploadFileValidator {

  public List<FeedbackMessage> validate(InputStream csvStream) {
    final MappingIterator<Map<String, String>> valueIterator = getIteratorForCsv(csvStream);

    if (!valueIterator.hasNext()) {
      throw new IllegalArgumentException("Empty or invalid CSV submitted");
    }

    List<FeedbackMessage> errors = new ArrayList<>();

    while (valueIterator.hasNext() && errors.isEmpty()) {
      final Map<String, String> row = getNextRow(valueIterator);

      ValueOrError firstName = getValue(row, "FirstName", true);
      ValueOrError lastName = getValue(row, "LastName", true);
      ValueOrError middleName = getValue(row, "MiddleName", false);
      ValueOrError suffix = getValue(row, "Suffix", false);
      ValueOrError race = getValue(row, "Race", true);
      ValueOrError dob = getValue(row, "DOB", true);
      ValueOrError biologicalSex = getValue(row, "biologicalSex", true);
      ValueOrError ethnicity = getValue(row, "Ethnicity", true);
      ValueOrError street = getValue(row, "Street", true);
      ValueOrError street2 = getValue(row, "Street2", false);
      ValueOrError city = getValue(row, "City", false);
      ValueOrError county = getValue(row, "County", false);
      ValueOrError state = getValue(row, "State", true);
      ValueOrError zipCode = getValue(row, "ZipCode", true);
      ValueOrError phoneNumber = getValue(row, "PhoneNumber", true);
      ValueOrError phoneNumberType = getValue(row, "PhoneNumberType", false);
      ValueOrError employedInHealthcare = getValue(row, "employedInHealthcare", true);
      ValueOrError residentCongregateSetting = getValue(row, "residentCongregateSetting", true);
      ValueOrError role = getValue(row, "role", false);
      ValueOrError email = getValue(row, "email", false);

      List<ValueOrError> allFields =
          List.of(
              firstName,
              lastName,
              middleName,
              suffix,
              race,
              dob,
              biologicalSex,
              ethnicity,
              street,
              street2,
              city,
              county,
              state,
              zipCode,
              phoneNumber,
              phoneNumberType,
              employedInHealthcare,
              residentCongregateSetting,
              role,
              email);

      // validate headers
      allFields.forEach(field -> errors.addAll(field.getPossibleError()));

      // validate individual values

      // demographics
      errors.addAll(validateDate(dob));
      errors.addAll(validateRace(race));
      errors.addAll(validateBiologicalSex(biologicalSex));
      errors.addAll(validateEthnicity(ethnicity));
      errors.addAll(validateYesNoAnswer(employedInHealthcare));
      errors.addAll(validateYesNoAnswer(residentCongregateSetting));
      errors.addAll(validateRole(role));

      // address
      errors.addAll(validateState(state));
      errors.addAll(validateZipCode(zipCode));

      // contact info
      errors.addAll(validatePhoneNumber(phoneNumber));
      errors.addAll(validatePhoneNumberType(phoneNumberType));
      errors.addAll(validateEmail(email));
    }

    return errors;
  }
}
