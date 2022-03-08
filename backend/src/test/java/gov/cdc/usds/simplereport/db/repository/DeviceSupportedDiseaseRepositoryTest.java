package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.db.model.DeviceSupportedDisease;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class DeviceSupportedDiseaseRepositoryTest extends BaseRepositoryTest {

  @Autowired private DeviceSupportedDiseaseRepository _repo;
  @Autowired private TestDataFactory _factory;

  private SupportedDisease COVID_19;
  private SupportedDisease FLU_A;
  private SupportedDisease FLU_B;

  private DeviceType BINAX_NOW;
  private DeviceType SOFIA;

  // @BeforeAll is executed outside the context of a requesting thread, which breaks our JPA
  // auditing, so we use a BeforeEach instead.
  @BeforeEach
  void createDiseaseAndDevices() {
    COVID_19 = _factory.createSupportedDisease("COVID-19", "1");
    FLU_A = _factory.createSupportedDisease("Flu A", "2");
    FLU_B = _factory.createSupportedDisease("Flu B", "3");

    BINAX_NOW = _factory.createDeviceType("BinaxNow", "Abbot", "BinaxNow", "123", "nasal");
    SOFIA = _factory.createDeviceType("Sofia 2 Antigen", "Quidel", "Sofia 2", "456", "nasal");
  }

  @Test
  void findAllSuccessfulWithDeviceType() {
    _repo.save(new DeviceSupportedDisease(BINAX_NOW, COVID_19));

    List<DeviceSupportedDisease> binaxDiseases = _repo.findAllByDeviceType(BINAX_NOW);
    assertEquals(binaxDiseases.size(), 1);
  }

  @Test
  void findAllDiseasesForADeviceType() {
    _repo.save(new DeviceSupportedDisease(BINAX_NOW, COVID_19));
    _repo.save(new DeviceSupportedDisease(SOFIA, COVID_19));
    _repo.save(new DeviceSupportedDisease(SOFIA, FLU_A));
    _repo.save(new DeviceSupportedDisease(SOFIA, FLU_B));

    List<SupportedDisease> binaxDiseases = _repo.findSupportedDiseaseByDeviceType(BINAX_NOW);
    assertEquals(binaxDiseases.size(), 1);
    assertTrue(binaxDiseases.contains(COVID_19));

    List<SupportedDisease> sofiaDiseases = _repo.findSupportedDiseaseByDeviceType(SOFIA);
    assertEquals(sofiaDiseases.size(), 3);
    assertTrue(sofiaDiseases.contains(FLU_A));
  }

  @Test
  void findAllSuccessfulWithSupportedDisease() {
    _repo.save(new DeviceSupportedDisease(BINAX_NOW, COVID_19));
    _repo.save(new DeviceSupportedDisease(SOFIA, COVID_19));

    List<DeviceSupportedDisease> deviceSupportedDiseases =
        _repo.findAllBySupportedDisease(COVID_19);
    assertEquals(deviceSupportedDiseases.size(), 2);
  }

  @Test
  void findAllDevicesForASupportedDisease() {
    _repo.save(new DeviceSupportedDisease(BINAX_NOW, COVID_19));
    _repo.save(new DeviceSupportedDisease(SOFIA, COVID_19));
    _repo.save(new DeviceSupportedDisease(SOFIA, FLU_A));
    _repo.save(new DeviceSupportedDisease(SOFIA, FLU_B));

    List<DeviceType> covidDevices = _repo.findDevicesBySupportedDisease(COVID_19);
    assertEquals(covidDevices.size(), 2);
    assertTrue(covidDevices.contains(BINAX_NOW));
    assertTrue(covidDevices.contains(SOFIA));

    List<DeviceType> fluDevices = _repo.findDevicesBySupportedDisease(FLU_A);
    assertEquals(fluDevices.size(), 1);
  }
}
