package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class DeviceTestPerformedLoincCode extends IdentifiedEntity {

  @ManyToOne
  @JoinColumn(name = "device_type_id")
  private DeviceType deviceType;

  @ManyToOne
  @JoinColumn(name = "supported_disease_id")
  private SupportedDisease supportedDisease;

  @Column private String testPerformedLoincCode;
}
