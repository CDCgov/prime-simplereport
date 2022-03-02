package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.db.model.DeviceSupportedDisease;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.List;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class DeviceSupportedDiseaseRepositoryTest extends BaseRepositoryTest {

  @Autowired private DeviceSupportedDiseaseRepository _repo;
  @Autowired private SupportedDiseaseRepository _supportedDiseaseRepo;
  @Autowired private TestDataFactory _factory;

  private SupportedDisease COVID_19;
  private SupportedDisease FLU_A;
  private SupportedDisease FLU_B;

  private DeviceType BINAX_NOW;
  private DeviceType LUMIRA;
  private DeviceType SOFIA;
  private DeviceType ALINITY;

  @BeforeAll
  void populateDeviceSupportedDiseases() {
    // AbbotBinaxNow - COVID-19
    // Lumira DX - COVID-19
    // Quidel Sofia 2 - COVID-19, Flu A, and Flu B
    // Abbot Alinity M - COVID-19, Flu A, and Flu B

    COVID_19 = _supportedDiseaseRepo.save(new SupportedDisease("COVID-19", "1"));
    //    COVID_19 = _factory.createSupportedDisease("COVID-19", "1");
    //    FLU_A =  _factory.createSupportedDisease("Flu A", "2");
    //    FLU_B = _factory.createSupportedDisease("Flu B", "3");

    BINAX_NOW = _factory.createDeviceType("BinaxNow", "Abbot", "BinaxNow", "123", "nasal");
    LUMIRA = _factory.createDeviceType("LumiraDX", "Lumira", "DX", "111", "nasal");
    SOFIA = _factory.createDeviceType("Sofia 2 Antigen", "Quidel", "Sofia 2", "456", "nasal");
    ALINITY = _factory.createDeviceType("Alinity M", "Abbot", "Alinity M", "789", "nasal");

    _repo.save(new DeviceSupportedDisease(BINAX_NOW, COVID_19));
    _repo.save(new DeviceSupportedDisease(LUMIRA, COVID_19));
    _repo.save(new DeviceSupportedDisease(SOFIA, COVID_19));
    //    _repo.save(new DeviceSupportedDisease(SOFIA, FLU_A));
    //    _repo.save(new DeviceSupportedDisease(SOFIA, FLU_B));
    //    _repo.save(new DeviceSupportedDisease(ALINITY, COVID_19));
    //    _repo.save(new DeviceSupportedDisease(ALINITY, FLU_A));
    //    _repo.save(new DeviceSupportedDisease(ALINITY, FLU_B));
  }

  // Test 1: When a new pair is added to the repo, it can be found with findAll on the device

  // Test 1: A device that supports a single disease returns a single item in a list
  @Test
  void findAllSuccessfulWithDeviceType() {
    List<DeviceSupportedDisease> binaxDiseases = _repo.findAllByDeviceType(BINAX_NOW);
    assertEquals(binaxDiseases.size(), 1);
  }

  // Test 2: When a new pair is added to the repo, it can be found with findAll on the disease

  // Test 3: When a new pair is added to the repo, it can be found with both the deviceType and
  // supportedDisease

  // Test 4: When you search for an invalid combination, Optional.empty() is returned

}
