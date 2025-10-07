package gov.cdc.usds.simplereport.db.model;

import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;
import javax.persistence.Table;
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
