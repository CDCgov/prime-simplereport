package gov.cdc.usds.simplereport.api.model;

import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdateFacilityInput {
  private UUID facilityId;
  private String facilityName;
  private String cliaNumber;
  private AddressInput address;
  private String phone;
  private String email;
  private AddProviderInput orderingProvider;
  private List<UUID> deviceIds;
}
