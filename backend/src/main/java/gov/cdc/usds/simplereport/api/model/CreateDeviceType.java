package gov.cdc.usds.simplereport.api.model;

import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Builder
@Getter
@ToString
public class CreateDeviceType {
  private String name;
  private String manufacturer;
  private String model;
  private List<UUID> swabTypes;
  private List<SupportedDiseaseTestPerformedInput> supportedDiseaseTestPerformed;
  private int testLength;
}
