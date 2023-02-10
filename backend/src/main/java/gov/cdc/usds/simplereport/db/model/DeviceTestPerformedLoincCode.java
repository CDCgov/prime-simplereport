package gov.cdc.usds.simplereport.db.model;

import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class DeviceTestPerformedLoincCode extends IdentifiedEntity {

  @Column(name = "device_type_id")
  private UUID deviceTypeId;

  @ManyToOne
  @JoinColumn(name = "supported_disease_id")
  private SupportedDisease supportedDisease;

  @Column private String testPerformedLoincCode;
  @Column private String equipmentUid;
  @Column private String testkitNameId;
}
