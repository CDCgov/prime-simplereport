package gov.cdc.usds.simplereport.service.model;

import java.time.LocalDate;

public record ExistingPatientCheckRequestBody(
    String firstName, String lastName, LocalDate birthDate, String postalCode) {}
