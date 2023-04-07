package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.SupportedDiseaseTestPerformedInput;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.DeviceTypeSpecimenTypeMapping;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeNewRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

  private static final Set<String> FluA_DEVICE_SYNC_BLOCK_LIST =
      Set.of(
          "BioCode CoV-2 Flu Plus Assay|Applied BioCode, Inc.",
          "BioFire Respiratory Panel 2.1-EZ (RP2.1-EZ)|BioFire Diagnostics, LLC",
          "NxTAG Respiratory Pathogen Panel + SARS-CoV-2|Luminex Molecular Diagnostics, Inc.",
          "QIAstat-Dx Respiratory SARS-CoV-2 Panel|QIAGEN GmbH",
          "ePlex Respiratory Pathogen Panel 2|GenMark Diagnostics, Inc.");

  private static final Set<String> COVID19_DEVICE_SYNC_BLOCK_LIST =
      Set.of(
          "ACON SARS-CoV-2 IgG/IgM Rapid Test|ACON Laboratories, Inc.",
          "ADVIA Centaur SARS-CoV-2 IgG (sCOVG)|Siemens Healthcare Diagnostics Inc.",
          "ARGENE SARS-COV-2 R-GENE|bioMérieux",
          "Access SARS-CoV-2 IgG II|Beckman Coulter, Inc.",
          "Alinity i|Abbott",
          "Architect i1000SR|Abbott",
          "Architect i2000SR|Abbott",
          "Assure COVID-19 IgG/IgM Rapid Test Device|Assure Tech. (Hangzhou Co., Ltd)",
          "Atellica IM SARS-CoV-2 IgG (sCOVG)|Siemens Healthcare Diagnostics Inc.",
          "BioPlex 2200 SARS-CoV-2 IgG|Bio-Rad Laboratories",
          "COVID-19 IgG/IgM Rapid Test Cassette (Whole Blood/Serum/Plasma)|Healgen Scientific",
          "COVID-SeroKlir, Kantaro Semi-Quantitative SARS-CoV-2 IgG Antibody Kit|Kantaro Biosciences, LLC",
          "COVIDSeq Test|Illumina",
          "Diazyme DZ-Lite SARS-CoV-2 IgG CLIA Kit|Diazyme Laboratories, Inc.",
          "Dimension EXL SARS-CoV-2 IgG (CV2G)|Siemens Healthcare Diagnostics Inc.",
          "Dimension Vista SARS-CoV-2 IgG (COV2G)|Siemens Healthcare Diagnostics Inc.",
          "EUROIMMUN Anti-SARS-CoV-2 S1 Curve ELISA (IgG)|EUROIMMUN US, Inc.",
          "EliA SARS-CoV-2-Sp1 IgG Test|Phadia AB",
          "Innovita 2019-nCoV Ab Test (Colloidal Gold)|Innovita (Tangshan) Biological Technology Co., Ltd.",
          "LDT: Express Gene 2019-nCoV RT-PCR Diagnostic Panel|Express Gene LLC, DBA: Express Gene Molecular Diagnostics Laboratory",
          "LDT: Gravity Diagnostics SARS-CoV-2 RT-PCR Assay|Gravity Diagnostics, LLC",
          "LDT: Infinity BiologiX TaqPath SARS-CoV-2 Assay|Infinity BiologiX LLC",
          "LDT: Wren Laboratories COVID-19 PCR Test|Wren Laboratories LLC",
          "LIAISON SARS-CoV-2 TrimericS IgG|DiaSorin, Inc.",
          "LumiraDx SARS-CoV-2 & Flu A/B RNA STAR Complete Assay|LumiraDx UK Ltd.",
          "MAGLUMI 2019-nCoV IgM/IgG|Shenzhen New Industries Biomedical Engineering Co., Ltd.",
          "Metrix COVID-19 Test|Aptitude Medical Systems Inc.",
          "MidaSpot COVID-19 Antibody Combo Detection Kit|Nirmidas Biotech, Inc.",
          "NeuMoDx SARS-CoV-2 Assay|NeuMoDx Molecular, Inc.",
          "New York SARS-CoV-2 Real-time Reverse Transcriptase (RT)-PCR Diagnostic Panel|Wadsworth Center, New York State Department of Public Health",
          "Nirmidas COVID-19 (SARS-CoV-2) IgM/IgG Antibody Detection Kit|Nirmidas Biotech, Inc.",
          "Orawell IgM/IgG Rapid Test|Jiangsu Well Biotech Co., Ltd.",
          "PerkinElmer New Coronavirus Nucleic Acid Detection Kit test|PerkinElmer",
          "Phosphorus COVID-19 RT-qPCR Test|Phosphorus Diagnostics LLC",
          "QUANTA Flash SARS-CoV-2 IgG|Inova Diagnostics, Inc.",
          "Rapid COVID-19 IgM/IgG Combo Test Kit|Megna Health, Inc.",
          "Rheonix COVID-19 MDx Assay|Rheonix Inc.",
          "RightSign COVID-19 IgG/IgM Rapid Test Cassette|Hangzhou Biotest Biotech",
          "SARS-CoV-2 IgM/IgG Antibody Test Kit|Biohit Healthcare",
          "Sienna-Clarity COVIBLOCK COVID-19 IgG/IgM Rapid Test Cassette|Salofa Oy",
          "Simoa Semi-Quantitative SARS-CoV-2 IgG Antibody Test|Quanterix Corporation",
          "TBG SARS-CoV-2 IgG / IgM Rapid Test Kit|TBG Biotechnology",
          "TRUPCR SARS-CoV-2 Kit|3B Blackbio Biotech India",
          "TaqPath SARS-CoV-2 Assay|P23 Labs",
          "VITROS Immunodiagnostic Products Anti-SARS-CoV-2 IgG Quantitative Reagent Pack used in combination with the VITROS Immunodiagnostic Products Anti- SARS-CoV-2 IgG Quantitative Calibrator|Ortho-Clinical Diagnostics, Inc.",
          "Vibrant COVID-19 Ab Assay|Vibrant",
          "Xiamen BIOTIME SARS-CoV-2 IgG/IgM Rapid Qualitative Test|Xiamen Biotime Biotechnology Co., Ltd.",
          "cobas SARS-CoV-2 Duo for use on the cobas 6800/8800 Systems|Roche Molecular Systems, Inc.",
          "cobas e 402|Roche",
          "cobas e 411|Roche",
          "cobas e 601|Roche",
          "cobas e 602|Roche",
          "cobas e 801|Roche",
          "qSARS-CoV-2 IgG/IgM Rapid Test|Cellex");

  private static final Set<String> COVID_VENDOR_ANALYTE_NAMES =
      new HashSet<>(
          Arrays.asList(
              "sars-cov-2",
              "cov-2",
              "sarscov2",
              "sars-cov2",
              "covid",
              "sars-2019-ncov",
              "2019-ncovrna",
              "sars antigen result"));
  private static final Set<String> FLU_A_VENDOR_ANALYTE_NAMES =
      new HashSet<>(Arrays.asList("flu a", "influenza a", "flua", "infa result"));
  private static final Set<String> FLU_B_VENDOR_ANALYTE_NAMES =
      new HashSet<>(Arrays.asList("flu b", "influenza b", "flub", "infb result"));

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
      device.getSupportedDiseaseTestPerformed().clear();
      device.getSupportedDiseaseTestPerformed().addAll(deviceTypeDiseaseList);
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
                createDevice.getTestLength()));

    specimenTypes.stream()
        .map(
            specimenType ->
                new DeviceTypeSpecimenTypeMapping(dt.getInternalId(), specimenType.getInternalId()))
        .forEach(deviceSpecimenTypeNewRepository::save);

    var deviceTypeDiseaseList =
        createDeviceTypeDiseaseList(createDevice.getSupportedDiseaseTestPerformed(), dt);
    dt.getSupportedDiseaseTestPerformed().addAll(deviceTypeDiseaseList);
    deviceTypeRepository.save(dt);

    return dt;
  }

  public ArrayList<DeviceTypeDisease> createDeviceTypeDiseaseList(
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
}
