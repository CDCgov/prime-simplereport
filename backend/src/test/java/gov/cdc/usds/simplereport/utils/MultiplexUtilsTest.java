package gov.cdc.usds.simplereport.utils;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

public class MultiplexUtilsTest {
  @Test
  void inferMultiplexTestOrderLoinc_getsCalledWithEmptySupportedDiseaseTestPerformed() {
    assertEquals(null, MultiplexUtils.inferMultiplexTestOrderLoinc(new ArrayList<>()));
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
}
