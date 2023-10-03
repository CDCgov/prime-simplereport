package gov.cdc.usds.simplereport.utils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class MultiplexUtilsTest {
  @Test
  void inferMultiplexTestOrderLoinc_getsCalledWithEmptySupportedDiseaseTestPerformed() {
    assertNull(MultiplexUtils.inferMultiplexTestOrderLoinc(new ArrayList<>()));
  }

  @Test
  void inferMultiplexTestOrderLoinc_findsTestOrderedLoincThatRepeats() {
    List<DeviceTypeDisease> supportedDiseaseTestsOrders =
        List.of(
            DeviceTypeDisease.builder()
                .testPerformedLoincCode("loincFluA")
                .equipmentUid("equipmentUid2")
                .testkitNameId("testkitNameId2")
                .testOrderedLoincCode("loincMultiplex")
                .build(),
            DeviceTypeDisease.builder()
                .testPerformedLoincCode("loincFluB")
                .equipmentUid("equipmentUid2")
                .testkitNameId("testkitNameId2")
                .testOrderedLoincCode("loincMultiplex")
                .build(),
            DeviceTypeDisease.builder()
                .testPerformedLoincCode("loincCovid")
                .equipmentUid("equipmentUid2")
                .testkitNameId("testkitNameId2")
                .testOrderedLoincCode("loincNotMultiplex")
                .build());
    assertEquals(
        "loincMultiplex", MultiplexUtils.inferMultiplexTestOrderLoinc(supportedDiseaseTestsOrders));
  }

  @Test
  void inferMultiplexTestOrderLoinc_getsCalledWithSupportedDiseaseTestPerformedWithSomeLoinc() {
    List<DeviceTypeDisease> supportedDiseaseTestsOrders =
        List.of(
            DeviceTypeDisease.builder()
                .testPerformedLoincCode("loincFluA")
                .equipmentUid("equipmentUid2")
                .testkitNameId("testkitNameId2")
                .build(),
            DeviceTypeDisease.builder()
                .testPerformedLoincCode("loincFluB")
                .equipmentUid("equipmentUid2")
                .testkitNameId("testkitNameId2")
                .testOrderedLoincCode("loincMultiplex")
                .build(),
            DeviceTypeDisease.builder()
                .testPerformedLoincCode("loincCovid")
                .equipmentUid("equipmentUid2")
                .testkitNameId("testkitNameId2")
                .build());
    assertEquals(
        "loincMultiplex", MultiplexUtils.inferMultiplexTestOrderLoinc(supportedDiseaseTestsOrders));
  }

  @Test
  void inferMultiplexTestOrderLoinc_getsCalledWithSupportedDiseaseTestPerformedWithNoloinc() {
    List<DeviceTypeDisease> supportedDiseaseTestsOrders =
        List.of(
            DeviceTypeDisease.builder()
                .testPerformedLoincCode("loincFluA")
                .equipmentUid("equipmentUid2")
                .testkitNameId("testkitNameId2")
                .build(),
            DeviceTypeDisease.builder()
                .testPerformedLoincCode("loincFluB")
                .equipmentUid("equipmentUid2")
                .testkitNameId("testkitNameId2")
                .build(),
            DeviceTypeDisease.builder()
                .testPerformedLoincCode("loincCovid")
                .equipmentUid("equipmentUid2")
                .testkitNameId("testkitNameId2")
                .build());
    assertEquals(null, MultiplexUtils.inferMultiplexTestOrderLoinc(supportedDiseaseTestsOrders));
  }
}
