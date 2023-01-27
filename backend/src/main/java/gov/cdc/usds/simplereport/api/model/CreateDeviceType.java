package gov.cdc.usds.simplereport.api.model;

import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class CreateDeviceType {
  private String name;
  private String manufacturer;
  private String model;
  private String loincCode;
  private String equipmentUid;
  private String testkitNameId;
  private List<UUID> swabTypes;
  private List<UUID> supportedDiseases;
  private List<SupportedDiseaseTestPerformedInput> supportedDiseaseTestPerformed;
  private int testLength;
}
