package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.CreateSpecimenType;
import gov.cdc.usds.simplereport.api.model.SupportedDiseaseTestPerformedInput;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.DeviceTypeSpecimenTypeMapping;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeNewRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import gov.cdc.usds.simplereport.service.model.reportstream.LIVDResponse;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for fetching the device-type reference list (<i>not</i> the device types available for a
 * specific facility or organization).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DeviceTypeService {

  private static final String SWAB_TYPE_DELETED_MESSAGE =
      "swab type has been deleted and cannot be used";

  private static final Set<String> COVID_VENDOR_ANALYTE_NAMES =
      new HashSet<>(
          Arrays.asList(
              "sars-cov-2",
              "cov-2",
              "sarscov2",
              "sars-cov2",
              "covid",
              "sars-2019-ncov",
              "2019-ncovrna"));
  private static final Set<String> FLU_A_VENDOR_ANALYTE_NAMES =
      new HashSet<>(Arrays.asList("flu a", "influenza a", "flua", "infa result"));
  private static final Set<String> FLU_B_VENDOR_ANALYTE_NAMES =
      new HashSet<>(Arrays.asList("flu b", "influenza b", "flub", "infb result"));
  private static final Set<String> RSV_VENDOR_ANALYTE_NAMES =
      new HashSet<>(Arrays.asList("rsv", "respiratory syncytial virus"));

  private final DeviceTypeRepository deviceTypeRepository;
  private final DataHubClient client;
  private final DeviceSpecimenTypeNewRepository deviceSpecimenTypeNewRepository;
  private final SpecimenTypeRepository specimenTypeRepository;
  private final SupportedDiseaseRepository supportedDiseaseRepository;
  private final DiseaseService diseaseService;
  private final SpecimenTypeService specimenTypeService;

  @Value("${simple-report.device-sync-livd.enabled:false}")
  private boolean deviceSyncEnabled;

  @Transactional
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public void removeDeviceType(DeviceType d) {
    deviceTypeRepository.delete(d);
  }

  public List<DeviceType> fetchDeviceTypes() {
    return deviceTypeRepository.findAll();
  }

  public DeviceType getDeviceType(UUID internalId) {
    return deviceTypeRepository
        .findById(internalId)
        .orElseThrow(() -> new IllegalGraphqlArgumentException("invalid device type ID"));
  }

  public DeviceType getDeviceType(String name) {
    return deviceTypeRepository.findDeviceTypeByName(name);
  }

  @Transactional
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public DeviceType updateDeviceType(UpdateDeviceType updateDevice) {

    DeviceType device = getDeviceType(updateDevice.getInternalId());
    if (updateDevice.getName() != null) {
      device.setName(updateDevice.getName());
    }
    if (updateDevice.getTestLength() > 0) {
      device.setTestLength(updateDevice.getTestLength());
    }
    if (updateDevice.getManufacturer() != null) {
      device.setManufacturer(updateDevice.getManufacturer());
    }
    if (updateDevice.getModel() != null) {
      device.setModel(updateDevice.getModel());
    }
    if (updateDevice.getSwabTypes() != null) {
      List<SpecimenType> updatedSpecimenTypes =
          updateDevice.getSwabTypes().stream()
              .map(specimenTypeRepository::findById)
              .filter(Optional::isPresent)
              .map(Optional::get)
              .toList();

      updatedSpecimenTypes.forEach(
          specimenType -> {
            if (specimenType.isDeleted()) {
              throw new IllegalGraphqlArgumentException(SWAB_TYPE_DELETED_MESSAGE);
            }
          });

      List<DeviceTypeSpecimenTypeMapping> newDeviceSpecimenTypes =
          updatedSpecimenTypes.stream()
              .map(
                  specimenType ->
                      new DeviceTypeSpecimenTypeMapping(
                          device.getInternalId(), specimenType.getInternalId()))
              .collect(Collectors.toList());

      List<DeviceTypeSpecimenTypeMapping> exitingDeviceSpecimenTypes =
          deviceSpecimenTypeNewRepository.findAllByDeviceTypeId(device.getInternalId());

      // delete old ones
      ArrayList<DeviceTypeSpecimenTypeMapping> toBeDeletedDeviceSpecimenTypes =
          new ArrayList<>(exitingDeviceSpecimenTypes);
      toBeDeletedDeviceSpecimenTypes.removeAll(newDeviceSpecimenTypes);
      deviceSpecimenTypeNewRepository.deleteAll(toBeDeletedDeviceSpecimenTypes);

      // create new ones
      ArrayList<DeviceTypeSpecimenTypeMapping> toBeAddedDeviceSpecimenTypes =
          new ArrayList<>(newDeviceSpecimenTypes);
      toBeAddedDeviceSpecimenTypes.removeAll(exitingDeviceSpecimenTypes);
      deviceSpecimenTypeNewRepository.saveAll(toBeAddedDeviceSpecimenTypes);
    }

    if (updateDevice.getSupportedDiseaseTestPerformed() != null) {
      var deviceTypeDiseaseList =
          createDeviceTypeDiseaseList(updateDevice.getSupportedDiseaseTestPerformed(), device);
      device.setSupportedDiseases(
          deviceTypeDiseaseList.stream()
              .map(DeviceTypeDisease::getSupportedDisease)
              .collect(Collectors.toList()));
      device.getSupportedDiseaseTestPerformed().clear();
      device.getSupportedDiseaseTestPerformed().addAll(deviceTypeDiseaseList);
    } else if (updateDevice.getSupportedDiseases() != null) {
      List<SupportedDisease> supportedDiseases =
          updateDevice.getSupportedDiseases().stream()
              .map(supportedDiseaseRepository::findById)
              .filter(Optional::isPresent)
              .map(Optional::get)
              .collect(Collectors.toList());
      device.setSupportedDiseases(supportedDiseases);
    }
    return deviceTypeRepository.save(device);
  }

  @Transactional
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public DeviceType createDeviceType(CreateDeviceType createDevice) {

    List<SpecimenType> specimenTypes =
        createDevice.getSwabTypes().stream()
            .map(uuid -> specimenTypeRepository.findById(uuid).get())
            .toList();

    specimenTypes.forEach(
        specimenType -> {
          if (specimenType.isDeleted()) {
            throw new IllegalGraphqlArgumentException(SWAB_TYPE_DELETED_MESSAGE);
          }
        });

    DeviceType dt =
        deviceTypeRepository.save(
            new DeviceType(
                createDevice.getName(),
                createDevice.getManufacturer(),
                createDevice.getModel(),
                null,
                null,
                createDevice.getTestLength()));

    specimenTypes.stream()
        .map(
            specimenType ->
                new DeviceTypeSpecimenTypeMapping(dt.getInternalId(), specimenType.getInternalId()))
        .forEach(deviceSpecimenTypeNewRepository::save);

    if (createDevice.getSupportedDiseaseTestPerformed() != null) {
      var deviceTypeDiseaseList =
          createDeviceTypeDiseaseList(createDevice.getSupportedDiseaseTestPerformed(), dt);
      dt.setSupportedDiseases(
          deviceTypeDiseaseList.stream()
              .map(DeviceTypeDisease::getSupportedDisease)
              .collect(Collectors.toList()));
      dt.getSupportedDiseaseTestPerformed().addAll(deviceTypeDiseaseList);
    } else {
      List<SupportedDisease> supportedDiseases =
          createDevice.getSupportedDiseases().stream()
              .map(supportedDiseaseRepository::findById)
              .filter(Optional::isPresent)
              .map(Optional::get)
              .collect(Collectors.toList());
      dt.setSupportedDiseases(supportedDiseases);
    }
    deviceTypeRepository.save(dt);

    return dt;
  }

  public String extractSpecimenTypeCode(String specimenDescription) {
    Pattern specimenCode = Pattern.compile("^(.*?)\\^");
    return extractSpecimenDetails(specimenDescription, specimenCode);
  }

  public String extractSpecimenTypeName(String specimenDescription) {
    Pattern specimenName = Pattern.compile("\\^(.*?)\\^");
    return extractSpecimenDetails(specimenDescription, specimenName);
  }

  private String extractSpecimenDetails(String specimenDescription, Pattern specimenName) {
    Pattern specimenDetails = Pattern.compile("\\(([^)]*)\\)[^(]*$");

    Matcher matcher = specimenDetails.matcher(specimenDescription);

    if (!matcher.find()) {
      return "";
    }

    var result = specimenName.matcher(matcher.group(1));

    if (!result.find()) {
      return "";
    }

    return result.group(1);
  }

  public List<UUID> getSpecimenTypeIdsFromDescription(LIVDResponse device) {
    return device.getVendorSpecimenDescription().stream()
        .map(this::parseVendorSpecimenDescription)
        .filter(Optional::isPresent)
        .map(Optional::get)
        .map(SpecimenType::getInternalId)
        .toList();
  }

  /**
   * Wrapper method for syncing devices from LIVD table so automation can call the inner method
   * without hitting the lock or conditions.
   */
  @Scheduled(initialDelay = 5, fixedRate = 10, timeUnit = TimeUnit.MINUTES)
  @SchedulerLock(
      name = "DeviceTypeService_syncDevices",
      lockAtLeastFor = "PT30S",
      lockAtMostFor = "PT30M")
  public void scheduledSyncDevices() {
    if (deviceSyncEnabled) {
      syncDevices();
    }
  }

  @Transactional
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public void syncDevices() {
    List<LIVDResponse> devices = client.getLIVDTable();

    var devicesToSync = new HashMap<DeviceType, ArrayList<SupportedDiseaseTestPerformedInput>>();
    var deviceSpecimens = new HashMap<String, List<UUID>>();

    devices.forEach(
        device -> {
          // Skip sync for any device entries with incomplete data
          if (device == null
              || device.getManufacturer() == null
              || device.getModel() == null
              || device.getVendorAnalyteName() == null) {
            log.info("One or more required values are not present in the LIVD entry");

            return;
          }

          // Does the device exist at all in the DB?
          var foundDevice =
              deviceTypeRepository.findDeviceTypeByManufacturerAndModel(
                  device.getManufacturer(), device.getModel());

          DeviceType deviceToSync =
              foundDevice.orElseGet(
                  () -> {
                    // Have we seen this device before? Gets its specimens
                    if (!deviceSpecimens.containsKey(
                        device.getModel() + device.getManufacturer())) {

                      deviceSpecimens.put(
                          device.getModel() + device.getManufacturer(),
                          getSpecimenTypeIdsFromDescription(device));
                    }

                    var specimensForDevice =
                        deviceSpecimens.get(device.getModel() + device.getManufacturer());
                    var supportedDisease =
                        getSupportedDiseaseFromVendorAnalyte(device.getVendorAnalyteName());

                    if (supportedDisease.isEmpty()) {
                      // Skip this device
                      log.info(
                          "Device {} does not contain required disease data", device.getModel());
                      return null;
                    }

                    // Device name should be the same as the model name, unless a device
                    // with that name already exists.
                    // If so, prepend with the manufacturer name before creation
                    var existingDeviceWithName =
                        deviceTypeRepository.findDeviceTypeByName(device.getModel());
                    var deviceName =
                        existingDeviceWithName == null
                            ? device.getModel()
                            : String.join(" ", device.getManufacturer(), device.getModel());

                    createDeviceType(
                        CreateDeviceType.builder()
                            .name(deviceName)
                            .manufacturer(device.getManufacturer())
                            .model(device.getModel())
                            .swabTypes(specimensForDevice)
                            .supportedDiseaseTestPerformed(
                                List.of(
                                    SupportedDiseaseTestPerformedInput.builder()
                                        .supportedDisease(supportedDisease.get().getInternalId())
                                        .testPerformedLoincCode(device.getTestPerformedLoincCode())
                                        .testOrderedLoincCode(device.getTestOrderedLoincCode())
                                        .testkitNameId(device.getTestKitNameId())
                                        .equipmentUid(device.getEquipmentUid())
                                        .build()))
                            .build());

                    log.info("Device {} created", deviceName);

                    return deviceTypeRepository
                        .findDeviceTypeByManufacturerAndModel(
                            device.getManufacturer(), device.getModel())
                        .get();
                  });

          if (!devicesToSync.containsKey(deviceToSync)) {
            devicesToSync.put(deviceToSync, new ArrayList<>());
          }

          if (!deviceSpecimens.containsKey(device.getModel() + device.getManufacturer())) {
            Set<UUID> allSpecimenTypes =
                deviceToSync.getSwabTypes().stream()
                    .map(SpecimenType::getInternalId)
                    .collect(Collectors.toCollection(LinkedHashSet::new));
            var incomingSpecimenTypes = getSpecimenTypeIdsFromDescription(device);
            if (!incomingSpecimenTypes.isEmpty()) {
              allSpecimenTypes.addAll(incomingSpecimenTypes);
            }

            List<UUID> specimenTypesToAdd = new ArrayList<>(allSpecimenTypes);

            deviceSpecimens.put(device.getModel() + device.getManufacturer(), specimenTypesToAdd);
          }

          var supportedDisease =
              getSupportedDiseaseFromVendorAnalyte(device.getVendorAnalyteName());

          if (supportedDisease.isEmpty()) {
            // Skip this device
            log.info("Device {} does not contain required disease data", device.getModel());

            return;
          }

          devicesToSync
              .get(deviceToSync)
              .add(
                  SupportedDiseaseTestPerformedInput.builder()
                      .supportedDisease(supportedDisease.get().getInternalId())
                      .testPerformedLoincCode(device.getTestPerformedLoincCode())
                      .testOrderedLoincCode(device.getTestOrderedLoincCode())
                      .equipmentUid(device.getEquipmentUid())
                      .testkitNameId(device.getTestKitNameId())
                      .build());
        });

    devicesToSync.forEach(
        (device, testsPerformed) -> {
          if (device == null) {
            return;
          }

          UpdateDeviceType input =
              UpdateDeviceType.builder()
                  // Update does not alter the device name
                  .internalId(device.getInternalId())
                  .manufacturer(device.getManufacturer())
                  .model(device.getModel())
                  .supportedDiseaseTestPerformed(testsPerformed)
                  .swabTypes(deviceSpecimens.get(device.getModel() + device.getManufacturer()))
                  .build();

          if (hasUpdates(input, device)) {
            try {
              updateDeviceType(input);
            } catch (IllegalGraphqlArgumentException ignored) {
              log.info("No updates for device {}, skipping sync", device.getName());
            }
          }
        });
  }

  private Optional<SpecimenType> parseVendorSpecimenDescription(String specimenDescription) {
    var specimenCode = extractSpecimenTypeCode(specimenDescription);

    if (Objects.equals(specimenCode, "")) {
      return Optional.empty();
    }

    var specimenType = specimenTypeRepository.findByTypeCode(specimenCode);

    return Optional.of(
        specimenType.orElseGet(
            () ->
                specimenTypeService.createSpecimenType(
                    CreateSpecimenType.builder()
                        .name(extractSpecimenTypeName(specimenDescription))
                        .typeCode(specimenCode)
                        .build())));
  }

  private ArrayList<DeviceTypeDisease> createDeviceTypeDiseaseList(
      List<SupportedDiseaseTestPerformedInput> supportedDiseaseTestPerformedInput,
      DeviceType device) {
    var deviceTypeDiseaseList = new ArrayList<DeviceTypeDisease>();
    supportedDiseaseTestPerformedInput.forEach(
        input -> {
          var supportedDisease = supportedDiseaseRepository.findById(input.getSupportedDisease());
          supportedDisease.ifPresent(
              disease ->
                  deviceTypeDiseaseList.add(
                      DeviceTypeDisease.builder()
                          .deviceTypeId(device.getInternalId())
                          .supportedDisease(disease)
                          .testPerformedLoincCode(input.getTestPerformedLoincCode())
                          .testOrderedLoincCode(input.getTestOrderedLoincCode())
                          .equipmentUid(input.getEquipmentUid())
                          .testkitNameId(input.getTestkitNameId())
                          .testOrderedLoincCode(input.getTestOrderedLoincCode())
                          .build()));
        });
    return deviceTypeDiseaseList;
  }

  private Optional<SupportedDisease> getSupportedDiseaseFromVendorAnalyte(String vendorAnalyte) {
    if (vendorAnalyte == null) {
      return Optional.empty();
    }

    String input = vendorAnalyte.toLowerCase();

    if (COVID_VENDOR_ANALYTE_NAMES.stream().anyMatch(input::contains)) {
      return Optional.of(diseaseService.covid());
    } else if (FLU_A_VENDOR_ANALYTE_NAMES.stream().anyMatch(input::contains)) {
      return Optional.of(diseaseService.fluA());
    } else if (FLU_B_VENDOR_ANALYTE_NAMES.stream().anyMatch(input::contains)) {
      return Optional.of(diseaseService.fluB());
    } else {
      return Optional.empty();
    }
  }

  private boolean hasUpdates(UpdateDeviceType update, DeviceType existing) {
    ArrayList<DeviceTypeDisease> incomingDiseases =
        createDeviceTypeDiseaseList(update.getSupportedDiseaseTestPerformed(), existing);
    List<UUID> incomingSwabs = update.getSwabTypes();

    if (existing.getSwabTypes() == null) {
      return true;
    }

    if (existing.getSupportedDiseaseTestPerformed() == null) {
      return true;
    }

    boolean hasDiseaseUpdates =
        !incomingDiseases.stream()
            .allMatch(
                d ->
                    existing.getSupportedDiseaseTestPerformed().stream()
                        .anyMatch(b -> b.equals(d)));
    boolean hasSwabUpdates =
        !incomingSwabs.stream()
            .allMatch(
                d ->
                    existing.getSwabTypes().stream()
                        .map(SpecimenType::getInternalId)
                        .anyMatch(b -> b.equals(d)));

    return hasDiseaseUpdates || hasSwabUpdates;
  }
}
