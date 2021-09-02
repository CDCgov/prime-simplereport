package gov.cdc.usds.simplereport.service.dataloader;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class TestOrderDeviceTypeDataLoader extends KeyedDataLoaderFactory<TestOrder, DeviceType> {
  public static final String KEY = "testOrder[*].deviceType";

  @Override
  public String getKey() {
    return KEY;
  }

  TestOrderDeviceTypeDataLoader(DeviceTypeRepository deviceTypeRepository) {
    super(
        testOrders ->
            CompletableFuture.supplyAsync(
                () -> {
                  List<UUID> testOrderIds =
                      testOrders.stream()
                          .map(TestOrder::getInternalId)
                          .collect(Collectors.toList());
                  Map<UUID, DeviceType> found =
                      deviceTypeRepository.findAllByTestOrdersInternalIdIn(testOrderIds).stream()
                          .collect(
                              Collectors.toMap(DeviceType::getInternalId, s -> s, (e, r) -> e));

                  return testOrders.stream()
                      .map(to -> found.getOrDefault(to.getDeviceType().getInternalId(), null))
                      .collect(Collectors.toList());
                }));
  }
}
