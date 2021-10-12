package gov.cdc.usds.simplereport.api.model;

import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class CreateDeviceType {
  String name;
  String manufacturer;
  String model;
  String loincCode;
  List<UUID> swabTypes;
}
