package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import gov.cdc.usds.simplereport.api.devicetype.PublicDeviceType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.boot.context.properties.bind.ConstructorBinding;

/** A disease that SimpleReport supports testing for. */
@Entity
@NoArgsConstructor
@Getter
public class SupportedDisease extends IdentifiedEntity {

  @Column(nullable = false)
  @JsonView(PublicDeviceType.class)
  private String name;

  @Column(nullable = false)
  @JsonView(PublicDeviceType.class)
  private String loinc;

  @JsonIgnore
  @OneToMany(mappedBy = "supportedDisease")
  private List<DeviceTypeDisease> supportedDiseaseTestPerformed = new ArrayList<>();

  @ConstructorBinding
  public SupportedDisease(String name, String loinc) {
    this();
    this.name = name;
    this.loinc = loinc;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    SupportedDisease that = (SupportedDisease) o;
    return Objects.equals(name, that.name) && Objects.equals(loinc, that.loinc);
  }

  @Override
  public int hashCode() {
    return Objects.hash(name, loinc);
  }
}
