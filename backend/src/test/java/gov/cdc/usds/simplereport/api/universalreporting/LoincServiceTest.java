package gov.cdc.usds.simplereport.api.universalreporting;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.db.model.Lab;
import gov.cdc.usds.simplereport.db.repository.LabRepository;
import gov.cdc.usds.simplereport.db.repository.LoincStagingRepository;
import gov.cdc.usds.simplereport.service.LoincFhirClient;
import gov.cdc.usds.simplereport.service.LoincService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@EnableAsync
@ActiveProfiles("test")
@SliceTestConfiguration.WithSimpleReportStandardUser
class LoincServiceTest {
  @Autowired private TestDataFactory testDataFactory;
  @Autowired private LabRepository labRepository;
  @MockBean private LoincFhirClient loincFhirClient;
  @MockBean private LoincStagingRepository loincStagingRepository;

  private LoincService loincService;

  @BeforeEach
  public void setUp() {
    loincService = new LoincService(loincFhirClient, loincStagingRepository, labRepository);
  }

  private void initData() {
    testDataFactory.createConditions(List.of("C001", "C002", "C003", "C004"));
    testDataFactory.createSpecimen("SYS001", "SP001");

    // labs for 3 valid scale_displays
    testDataFactory.createLab("L001", "Ord", "SYS001", "Both", List.of("C001", "C002"));
    testDataFactory.createLab("L002", "Qn", "SYS001", "Both", List.of("C001", "C002"));
    testDataFactory.createLab("L003", "Nom", "SYS001", "Both", List.of("C001", "C002"));
    // labs where orderOrObservation is not Both
    testDataFactory.createLab("L004", "Ord", "SYS001", "Order", List.of("C001", "C002"));
    testDataFactory.createLab("L005", "Ord", "SYS001", "Observation", List.of("C001", "C002"));
    // labs where scale_display is invalid
    testDataFactory.createLab("L006", "OrdQn", "SYS001", "Both", List.of("C001", "C002"));
    testDataFactory.createLab("L007", "Nar", "SYS001", "Both", List.of("C001", "C002"));
    // lab where system_code is empty
    testDataFactory.createLab("L008", "Ord", "", "Both", List.of("C001", "C002"));
    // lab where system_code has no specimens with that loinc_system_code
    testDataFactory.createLab("L009", "Ord", "SYS002", "Both", List.of("C001", "C002"));
    // lab for other conditions
    testDataFactory.createLab("L010", "Ord", "SYS001", "Both", List.of("C003", "C004"));
  }

  @Test
  void getLabsByConditionCodes_filtersResultTypeScaleDisplays() {
    // GIVEN
    initData();
    // WHEN
    List<Lab> labs = loincService.getLabsByConditionCodes(List.of("C001"));
    // THEN
    assertEquals(3, labs.size());
    assertEquals("L001", labs.get(0).getCode());
    assertEquals("L002", labs.get(1).getCode());
    assertEquals("L003", labs.get(2).getCode());
  }
}
