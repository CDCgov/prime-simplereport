package gov.cdc.usds.simplereport.api.model;

import java.util.UUID;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
public class UpdateFacilityInput extends AddFacilityInput {
  private UUID facilityId;
}
