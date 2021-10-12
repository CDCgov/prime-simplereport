package gov.cdc.usds.simplereport.api.model;

import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class UpdateDeviceType {
  UUID internalId;
  String name;
  String manufacturer;
  String model;
  String loincCode;
  List<UUID> swabTypes;
}
