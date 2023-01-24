package gov.cdc.usds.simplereport.db.model;

import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@IdClass(DeviceSupportedDiseaseId.class)
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class DeviceSupportedDisease {

  @Id
  @Column(name = "device_type_id", nullable = false)
  private UUID deviceTypeId;

  @Id
  @Column(name = "supported_disease_id", nullable = false)
  private UUID supportedDiseaseId;
}
