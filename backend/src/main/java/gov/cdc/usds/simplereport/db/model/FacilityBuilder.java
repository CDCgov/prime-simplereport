package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class FacilityBuilder {
  Organization org;
  String facilityName;
  String cliaNumber;
  StreetAddress facilityAddress;
  String phone;
  String email;
  Provider orderingProvider;
  DeviceType defaultDeviceType;
  SpecimenType defaultSpecimenType;
  List<DeviceType> configuredDevices;
}
