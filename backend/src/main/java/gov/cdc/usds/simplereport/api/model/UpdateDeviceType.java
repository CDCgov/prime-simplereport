package gov.cdc.usds.simplereport.api.model;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;
import org.apache.commons.collections.CollectionUtils;

@Builder
@Getter
@ToString
public class UpdateDeviceType {
  private UUID internalId;
  private String name;
  private String manufacturer;
  private String model;
  private List<UUID> swabTypes;
  private List<SupportedDiseaseTestPerformedInput> supportedDiseaseTestPerformed;
  private int testLength;

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    UpdateDeviceType that = (UpdateDeviceType) o;
    return Objects.equals(internalId, that.internalId)
        && Objects.equals(name, that.name)
        && Objects.equals(manufacturer, that.manufacturer)
        && Objects.equals(model, that.model)
        && CollectionUtils.isEqualCollection(swabTypes, that.swabTypes)
        && supportedDiseaseTestPerformed.stream()
            .allMatch(a -> that.supportedDiseaseTestPerformed.stream().anyMatch(b -> a.equals(b)))
        && supportedDiseaseTestPerformed.size() == that.supportedDiseaseTestPerformed.size()
        && Objects.equals(testLength, that.testLength);
  }
}
