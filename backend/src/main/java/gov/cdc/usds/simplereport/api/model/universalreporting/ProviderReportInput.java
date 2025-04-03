package gov.cdc.usds.simplereport.api.model.universalreporting;

import java.util.UUID;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Builder
public class ProviderReportInput {
  @Setter private UUID internalId;
  private String firstName;
  private String middleName;
  private String lastName;
  private String suffix;
  private String npi;
  private String street;
  private String streetTwo;
  private String city;
  private String county;
  private String state;
  private String zipCode;
  private String country;
  private String phone;
  private String email;
}
