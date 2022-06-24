package gov.cdc.usds.simplereport.api.queue;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.auxiliary.DiseaseResult;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.BaseServiceTest;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.TestOrderService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import lombok.SneakyThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

@SliceTestConfiguration.WithSimpleReportStandardUser
class QueueMutationResolverTest extends BaseServiceTest<PersonService> {
  @Autowired private TestDataFactory _dataFactory;

  private UUID _patientId;
  private DeviceType _deviceType;
  private DeviceSpecimenType _deviceSpecimenType;
  private final Date _dateTested = new Date();

  @BeforeEach
  void setup() {
    Organization _org = _dataFactory.createValidOrg();
    _patientId = _dataFactory.createMinimalPerson(_org).getInternalId();
    _deviceType = _dataFactory.getGenericDevice();
    _deviceSpecimenType = _dataFactory.getGenericDeviceSpecimen();
  }

  @SneakyThrows
  @Test
  void getDeviceSpecimenTypeId_callsGetDeviceSpecimenTypeId_whenNoDeviceSpecimenType() {
    var deviceTypeService = mock(DeviceTypeService.class);
    var personService = mock(PersonService.class);
    var testOrderService = mock(TestOrderService.class);
    var queueMutationResolver =
        new QueueMutationResolver(testOrderService, personService, deviceTypeService);
    UUID deviceUUID = _deviceType.getInternalId();
    String deviceId = deviceUUID.toString();

    // GIVEN
    when(deviceTypeService.getFirstDeviceSpecimenTypeForDeviceTypeId(deviceUUID))
        .thenReturn(_deviceSpecimenType);
    // WHEN
    queueMutationResolver.addTestResultNew(deviceId, null, "POSITIVE", _patientId, _dateTested);
    // THEN
    verify(deviceTypeService).getFirstDeviceSpecimenTypeForDeviceTypeId(eq(deviceUUID));
    verify(testOrderService)
        .addTestResult(
            eq(_deviceSpecimenType.getInternalId()),
            eq(TestResult.POSITIVE),
            eq(_patientId),
            eq(_dateTested));
  }

  @Test
  void getDeviceSpecimenTypeId_returnsDeviceSpecimenTypeId() {
    var deviceTypeService = mock(DeviceTypeService.class);
    var personService = mock(PersonService.class);
    var testOrderService = mock(TestOrderService.class);
    var queueMutationResolver =
        new QueueMutationResolver(testOrderService, personService, deviceTypeService);
    List<DiseaseResult> results = new ArrayList<>();
    results.add(new DiseaseResult(_diseaseService.covid().getName(), TestResult.POSITIVE));
    UUID deviceUUID = _deviceType.getInternalId();
    String deviceId = deviceUUID.toString();
    UUID deviceSpecimenTypeUUID = _deviceSpecimenType.getInternalId();
    UUID testOrderId = UUID.randomUUID();

    // WHEN
    queueMutationResolver.editQueueItemMultiplex(
        testOrderId, deviceId, deviceSpecimenTypeUUID, results, _dateTested);
    // THEN
    verify(deviceTypeService, never()).getFirstDeviceSpecimenTypeForDeviceTypeId(deviceUUID);
    verify(testOrderService)
        .editQueueItemMultiplex(
            eq(testOrderId), eq(deviceSpecimenTypeUUID), eq(results), eq(_dateTested));
  }
}
