package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "device_specimen_type")
@IdClass(DeviceSpecimenTypeNewId.class)
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class DeviceTypeSpecimenTypeMapping {

  @Id
  @Column(name = "device_type_id", nullable = false)
  private UUID deviceTypeId;

  @Id
  @Column(name = "specimen_type_id", nullable = false)
  private UUID specimenTypeId;
}
