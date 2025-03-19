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
public class CreateDeviceType {
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
    CreateDeviceType that = (CreateDeviceType) o;
    return Objects.equals(name, that.name)
        && Objects.equals(manufacturer, that.manufacturer)
        && Objects.equals(model, that.model)
        && CollectionUtils.isEqualCollection(swabTypes, that.swabTypes)
        && supportedDiseaseTestPerformed.stream()
            .allMatch(a -> that.supportedDiseaseTestPerformed.stream().anyMatch(a::equals))
        && supportedDiseaseTestPerformed.size() == that.supportedDiseaseTestPerformed.size()
        && Objects.equals(testLength, that.testLength);
  }
}
