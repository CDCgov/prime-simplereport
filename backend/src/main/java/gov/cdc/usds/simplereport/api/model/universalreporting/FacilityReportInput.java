package gov.cdc.usds.simplereport.api.model.universalreporting;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.CLIA_REGEX;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FacilityReportInput {
  @NotBlank private final String name;

  @NotNull
  @Pattern(regexp = CLIA_REGEX)
  private final String clia;

  private final String street;
  private final String streetTwo;
  private final String city;
  private final String county;
  private final String state;
  private final String zipCode;
  @NotBlank private final String phone;
  private final String email;
}
