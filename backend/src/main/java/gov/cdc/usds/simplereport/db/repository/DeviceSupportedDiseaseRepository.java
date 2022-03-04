package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.*;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface DeviceSupportedDiseaseRepository
    extends CrudRepository<DeviceSupportedDisease, UUID> {

  List<DeviceSupportedDisease> findAllByDeviceType(DeviceType deviceType);

  @Query(
      value =
          "SELECT dsd.supportedDisease "
              + "FROM DeviceSupportedDisease dsd "
              + "WHERE dsd.deviceType = :deviceType")
  List<SupportedDisease> findSupportedDiseaseByDeviceType(DeviceType deviceType);

  List<DeviceSupportedDisease> findAllBySupportedDisease(SupportedDisease supportedDisease);

  @Query(
      value =
          "SELECT dsd.deviceType "
              + "FROM DeviceSupportedDisease dsd "
              + "WHERE dsd.supportedDisease = :supportedDisease")
  List<DeviceType> findDevicesBySupportedDisease(SupportedDisease supportedDisease);
}
