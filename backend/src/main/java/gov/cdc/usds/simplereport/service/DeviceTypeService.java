package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.CreateSpecimenType;
import gov.cdc.usds.simplereport.api.model.SupportedDiseaseTestPerformedInput;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.DeviceTestPerformedLoincCode;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeSpecimenTypeMapping;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeNewRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import gov.cdc.usds.simplereport.service.model.reportstream.LIVDResponse;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for fetching the device-type reference list (<i>not</i> the device types available for a
 * specific facility or organization).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeviceTypeService {

  public static final String SWAB_TYPE_DELETED_MESSAGE =
      "swab type has been deleted and cannot be used";

  public static final Set<String> COVID_VENDOR_ANALYTE_NAMES = new HashSet<>(Arrays.asList("sars-cov-2", "cov-2", "sarscov2", "sars-cov2", "covid", "sars-2019-ncov", "2019-ncovrna"));
  public static final Set<String> FLU_A_VENDOR_ANALYTE_NAMES = new HashSet<>(Arrays.asList("flu a", "influenza a", "flua", "infa result"));
  public static final Set<String> FLU_B_VENDOR_ANALYTE_NAMES = new HashSet<>(Arrays.asList("flu b", "influenza b", "flub", "infb result"));
  public static final Set<String> RSV_VENDOR_ANALYTE_NAMES = new HashSet<>(Arrays.asList("rsv", "respiratory syncytial virus"));

  private final DeviceTypeRepository deviceTypeRepository;
  private final DataHubClient client;
  private final DeviceSpecimenTypeNewRepository deviceSpecimenTypeNewRepository;
  private final SpecimenTypeRepository specimenTypeRepository;
  private final SupportedDiseaseRepository supportedDiseaseRepository;
  private final DiseaseService diseaseService;
  private final SpecimenTypeService specimenTypeService;

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
    if (updateDevice.getLoincCode() != null) {
      device.setLoincCode(updateDevice.getLoincCode());
    }
    if (updateDevice.getSwabTypes() != null) {
      List<SpecimenType> updatedSpecimenTypes =
          updateDevice.getSwabTypes().stream()
              .map(specimenTypeRepository::findById)
              .filter(Optional::isPresent)
              .map(Optional::get)
              .collect(Collectors.toList());

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
      var deviceTestPerformedLoincCodeList =
          createDeviceTestPerformedLoincCodeList(
              updateDevice.getSupportedDiseaseTestPerformed(), device);
      device.setSupportedDiseases(
          deviceTestPerformedLoincCodeList.stream()
              .map(DeviceTestPerformedLoincCode::getSupportedDisease)
              .collect(Collectors.toList()));
      device.getSupportedDiseaseTestPerformed().clear();
      device.getSupportedDiseaseTestPerformed().addAll(deviceTestPerformedLoincCodeList);
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
            .collect(Collectors.toList());

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
                createDevice.getLoincCode(),
                null,
                createDevice.getTestLength()));

    specimenTypes.stream()
        .map(
            specimenType ->
                new DeviceTypeSpecimenTypeMapping(dt.getInternalId(), specimenType.getInternalId()))
        .forEach(deviceSpecimenTypeNewRepository::save);

    if (createDevice.getSupportedDiseaseTestPerformed() != null) {
      var deviceTestPerformedLoincCodeList =
          createDeviceTestPerformedLoincCodeList(
              createDevice.getSupportedDiseaseTestPerformed(), dt);
      dt.setSupportedDiseases(
          deviceTestPerformedLoincCodeList.stream()
              .map(DeviceTestPerformedLoincCode::getSupportedDisease)
              .collect(Collectors.toList()));
      dt.getSupportedDiseaseTestPerformed().addAll(deviceTestPerformedLoincCodeList);
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
    Pattern specimenDetails = Pattern.compile("\\(([^)]*)\\)[^(]*$");
//    Pattern specimenDetails = Pattern.compile("\\(([^()]*)\\)$");
//    Pattern specimenCode = Pattern.compile("\\((.*?)\\^");
    Pattern specimenCode = Pattern.compile("^(.*?)\\^");
    Matcher matcher = specimenDetails.matcher(specimenDescription);

    if (!matcher.find()) {
      // wut do if it doesn't match?
      return "";
    }

    var result = specimenCode.matcher(matcher.group(1));

    if (!result.find()) {
      // wut do if it doesn't match?
      return "";
    }

    return result.group(1);
  }

  public String extractSpecimenTypeName(String specimenDescription) {
//    Pattern specimenDetails = Pattern.compile("\\(([^()]*)\\)$");
    Pattern specimenDetails = Pattern.compile("\\(([^)]*)\\)[^(]*$");
//    Pattern specimenDetails = Pattern.compile("\\(([^()]*)\\)");
    Pattern specimenName = Pattern.compile("\\^(.*?)\\^");
    Matcher matcher = specimenDetails.matcher(specimenDescription);

    if (!matcher.find()) {
      // wut do if it doesn't match?
      return "";
    }

    var result = specimenName.matcher(matcher.group(1));

    if (!result.find()) {
      // wut do if it doesn't match?
      return "";
    }

    return result.group(1);
  }

  public List<UUID> getSpecimenTypeIdsFromDescription(LIVDResponse device) {
    return device.getVendorSpecimenDescription().stream()
        .map(this::parseVendorSpecimenDescription)
        .map(SpecimenType::getInternalId)
        .collect(Collectors.toList());
  }

  @Transactional
  @AuthorizationConfiguration.RequireGlobalAdminUser
  // TODO: void? List<DeviceType>?
  public void syncDevices() {
    // TODO: dry mode?
    List<LIVDResponse> devices = client.getLIVDTable();

    var devicesToSync = new HashMap<DeviceType, ArrayList<SupportedDiseaseTestPerformedInput>>();
    var deviceSpecimens = new HashMap<String, List<UUID>>();

    devices.forEach(
        device -> {
          if (device == null || device.getManufacturer() == null || device.getModel() == null || device.getVendorAnalyteName() == null) {
            return;
          }

          // Have we already seen this device in the response?
          // If so, create a DeviceTestPerformedLoincCode from entry and add to HashMap
          // Does the device exist at all?
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
                    var supportedDisease = getSupportedDiseaseFromVendorAnalyte(device.getVendorAnalyteName());

                    if (supportedDisease.isEmpty()) {
                      // Skip this device
                      return null;
                    }

                    createDeviceType(
                        CreateDeviceType.builder()
                            .name(device.getModel())
                            .manufacturer(device.getManufacturer())
                            .model(device.getModel())
                            .loincCode(device.getTestPerformedLoincCode())
                            .swabTypes(specimensForDevice)
                            .supportedDiseaseTestPerformed(
                                List.of(
                                    SupportedDiseaseTestPerformedInput.builder()
                                        .supportedDisease(supportedDisease.get().getInternalId())
                                        .testPerformedLoincCode(device.getTestPerformedLoincCode())
                                        .testkitNameId(device.getTestKitNameId())
                                        .equipmentUid(device.getEquipmentUid())
                                        .build()))
                            .build());

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

          var supportedDisease = getSupportedDiseaseFromVendorAnalyte(device.getVendorAnalyteName());

          if (supportedDisease.isEmpty()) {
            // Skip this device
            return;
          }

          devicesToSync
              .get(deviceToSync)
              .add(
                  SupportedDiseaseTestPerformedInput.builder()
                      .supportedDisease(supportedDisease.get().getInternalId())
                      .testPerformedLoincCode(device.getTestPerformedLoincCode())
                      .equipmentUid(device.getEquipmentUid())
                      .testkitNameId(device.getTestKitNameId())
                      .build());
        });

    devicesToSync.forEach(
        (device, testPerformed) -> {
          // Preserve any existing specimen types for a device, even if it does not appear in the
          // response
          // Merge and de-duplicate existing and incoming device specimen types
          /*
          Set<UUID> allSpecimenTypes = device.getSwabTypes().stream().map(SpecimenType::getInternalId).collect(Collectors.toCollection(LinkedHashSet::new));
          var incomingSpecimenTypes =deviceSpecimens.get(device.getModel() + device.getManufacturer());
          if (!incomingSpecimenTypes.isEmpty()) {
            allSpecimenTypes.addAll(incomingSpecimenTypes);
          }

          List<UUID> specimenTypesToAdd = new ArrayList<>(allSpecimenTypes);
          */

          // RSV?? Other diseases?
          UpdateDeviceType input =
              UpdateDeviceType.builder()
                  .internalId(device.getInternalId())
                  .name(device.getModel())
                  .manufacturer(device.getManufacturer())
                  .model(device.getModel())
                  .supportedDiseaseTestPerformed(testPerformed)
                  .swabTypes(deviceSpecimens.get(device.getModel() + device.getManufacturer()))
                  .build();

          updateDeviceType(input);
        });
  }

  private SpecimenType parseVendorSpecimenDescription(String specimenDescription) {
    // TODO: if the specimen is deleted in our DB but included in the response
    // - what do?
    // - what if the code can't be extracted?
    // ^ updateDeviceType method might already account for all of this
    var specimenCode = extractSpecimenTypeCode(specimenDescription);
    var specimenType = specimenTypeRepository.findByTypeCode(specimenCode);

    return specimenType.orElseGet(
        () ->
            specimenTypeService.createSpecimenType(
                CreateSpecimenType.builder()
                  .name(extractSpecimenTypeName(specimenDescription))
                    .typeCode(specimenCode)
                    .build()));
  }

  private ArrayList<DeviceTestPerformedLoincCode> createDeviceTestPerformedLoincCodeList(
      List<SupportedDiseaseTestPerformedInput> supportedDiseaseTestPerformedInput,
      DeviceType device) {
    var deviceTestPerformedLoincCodeList = new ArrayList<DeviceTestPerformedLoincCode>();
    supportedDiseaseTestPerformedInput.forEach(
        input -> {
          var supportedDisease = supportedDiseaseRepository.findById(input.getSupportedDisease());
          supportedDisease.ifPresent(
              disease ->
                  deviceTestPerformedLoincCodeList.add(
                      DeviceTestPerformedLoincCode.builder()
                          .deviceTypeId(device.getInternalId())
                          .supportedDisease(disease)
                          .testPerformedLoincCode(input.getTestPerformedLoincCode())
                          .equipmentUid(input.getEquipmentUid())
                          .testkitNameId(input.getTestkitNameId())
                          .build()));
        });
    return deviceTestPerformedLoincCodeList;
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
//    } else if (RSV_VENDOR_ANALYTE_NAMES.stream().anyMatch(input::contains)) {
//      return diseaseService.rsv();
    } else {
      return Optional.empty();
    }
  }
}
