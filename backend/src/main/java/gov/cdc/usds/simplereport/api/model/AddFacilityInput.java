package gov.cdc.usds.simplereport.api.model;

import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
public class AddFacilityInput {
  private String facilityName;
  private String cliaNumber;
  private String street;
  private String streetTwo;
  private String city;
  private String state;
  private String zipCode;
  private String phone;
  private String email;
  private ProviderInput orderingProvider;
  private List<UUID> deviceIds;
}
