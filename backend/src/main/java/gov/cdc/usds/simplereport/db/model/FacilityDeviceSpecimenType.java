package gov.cdc.usds.simplereport.db.model;

import java.util.UUID;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.MapsId;

@Entity
public class FacilityDeviceSpecimenType {
  @Id private UUID deviceSpecimenTypeId;

  public DeviceSpecimenType getDeviceSpecimenType() {
    return deviceSpecimenType;
  }

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId
  @JoinColumn(name = "device_specimen_type_id")
  private DeviceSpecimenType deviceSpecimenType;

  public Facility getFacility() {
    return facility;
  }

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "facility_id")
  private Facility facility;

  public FacilityDeviceSpecimenType() {}
}
