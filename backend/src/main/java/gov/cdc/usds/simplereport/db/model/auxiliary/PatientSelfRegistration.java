package gov.cdc.usds.simplereport.db.model.auxiliary;

import java.time.LocalDate;
import java.util.List;

public record PatientSelfRegistration(
    String registrationLink,
    String lookupId,
    String firstName,
    String middleName,
    String lastName,
    String suffix,
    LocalDate birthDate,
    StreetAddress address,
    String country,
    String telephone,
    List<PhoneNumberInput> phoneNumbers,
    String role,
    String email,
    List<String> emails,
    String race,
    String ethnicity,
    String tribalAffiliation,
    String gender,
    String genderIdentity,
    Boolean residentCongregateSetting,
    Boolean employedInHealthcare,
    String preferredLanguage,
    TestResultDeliveryPreference testResultDelivery) {}
