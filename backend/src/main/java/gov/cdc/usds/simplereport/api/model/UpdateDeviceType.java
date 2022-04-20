package gov.cdc.usds.simplereport.api.model;

import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class UpdateDeviceType {
  private UUID internalId;
  private String name;
  private String manufacturer;
  private String model;
  private String loincCode;
  private List<UUID> swabTypes;
  private List<UUID> supportedDiseases;
}
