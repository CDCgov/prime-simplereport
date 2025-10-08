package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.api.converter.FhirConstants.DETECTED_SNOMED;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.INVALID_SNOMED;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.NOT_DETECTED_SNOMED;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.formatToHL7DateTime;

import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.HapiContext;
import ca.uhn.hl7v2.model.v251.message.ORU_R01;
import ca.uhn.hl7v2.parser.Parser;
import gov.cdc.usds.simplereport.api.converter.HL7Converter;
import gov.cdc.usds.simplereport.api.converter.HapiContextProvider;
import gov.cdc.usds.simplereport.api.model.universalreporting.FacilityReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.PatientReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.ProviderReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.ResultScaleType;
import gov.cdc.usds.simplereport.api.model.universalreporting.SpecimenInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.TestDetailsInput;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.service.model.aphl.AimsDeviceSpecimen;
import gov.cdc.usds.simplereport.service.model.aphl.AimsJurisdiction;
import gov.cdc.usds.simplereport.utils.DateGenerator;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.info.GitProperties;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AimsTestingService {
  private final HL7Converter hl7Converter;
  private final GitProperties gitProperties;
  private final DateGenerator dateGenerator;
  private final AimsReportingService aimsReportingService;
  private final HapiContext hapiContext = HapiContextProvider.get();
  private final Parser parser = hapiContext.getPipeParser();
  private final String testFacilityName = "Test Facility";
  private final String testFacilityClia = "12D1234567";

  /**
   * Intended as a temporary method for generating test messages to STLTs to validate our production
   * device data, without requiring this to be deployed in prod for database access.
   */
  public String sendLegacyDeviceTestData(
      List<AimsJurisdiction> jurisdictions,
      List<DeviceTypeDisease> deviceTypeDiseases,
      List<AimsDeviceSpecimen> deviceSpecimens,
      boolean dryRun) {
    Date dateTested = dateGenerator.newDate();
    // The dates in FHS and BHS must be earlier or equal to date in MSH
    String batchDate = formatToHL7DateTime(dateTested);

    int totalMessagesSent = 0;
    int totalFilesSent = 0;

    Map<String, Set<DeviceTypeDisease>> deviceTypeDiseasesByDeviceId =
        mapDeviceTypeDiseaseByDeviceId(deviceTypeDiseases);
    Map<String, AimsDeviceSpecimen> specimensByDeviceId =
        mapDeviceToDefaultSpecimen(deviceSpecimens);

    for (AimsJurisdiction jurisdiction : jurisdictions) {
      List<String> encodedMessages =
          generateMessagesForJurisdiction(
              jurisdiction, deviceTypeDiseasesByDeviceId, specimensByDeviceId, dateTested);

      String hl7BatchFileString =
          hl7Converter.createBatchFileString(encodedMessages, encodedMessages.size(), batchDate);

      log.info(
          "AIMS STLT Testing: attempting to send {} messages to {}",
          encodedMessages.size(),
          jurisdiction.state());

      if (!dryRun) {
        aimsReportingService.sendBatchMessageToAims(
            UUID.randomUUID(), hl7BatchFileString, encodedMessages.size());
      }

      log.info(
          "AIMS STLT Testing: successfully sent {} messages to {}",
          encodedMessages.size(),
          jurisdiction.state());

      totalMessagesSent += encodedMessages.size();
      totalFilesSent++;
    }

    return String.format(
        "Sent %s total messages within %s total files to %s jurisdictions.",
        totalMessagesSent, totalFilesSent, jurisdictions.size());
  }

  private Map<String, AimsDeviceSpecimen> mapDeviceToDefaultSpecimen(
      List<AimsDeviceSpecimen> deviceSpecimenMappings) {
    Map<String, AimsDeviceSpecimen> deviceSpecimenMap = new HashMap<>();
    for (AimsDeviceSpecimen entry : deviceSpecimenMappings) {
      deviceSpecimenMap.putIfAbsent(entry.getDeviceTypeId().toString(), entry);
    }
    return deviceSpecimenMap;
  }

  private Map<String, Set<DeviceTypeDisease>> mapDeviceTypeDiseaseByDeviceId(
      List<DeviceTypeDisease> deviceTypeDiseases) {
    Map<String, Set<DeviceTypeDisease>> deviceMap = new HashMap<>();
    for (DeviceTypeDisease entry : deviceTypeDiseases) {
      deviceMap
          .computeIfAbsent(entry.getDeviceTypeId().toString(), k -> new HashSet<>())
          .add(entry);
    }
    return deviceMap;
  }

  private List<String> generateMessagesForJurisdiction(
      AimsJurisdiction jurisdiction,
      Map<String, Set<DeviceTypeDisease>> deviceIdToDeviceTypeDiseaseSet,
      Map<String, AimsDeviceSpecimen> deviceIdToDefaultSpecimen,
      Date dateTested) {
    List<String> messagesForJurisdiction = new ArrayList<>();

    PatientReportInput patient = generateFakePatient(jurisdiction);
    ProviderReportInput provider = generateFakeProvider(jurisdiction);
    FacilityReportInput facility = generateFakeFacility(jurisdiction);

    for (Map.Entry<String, Set<DeviceTypeDisease>> entry :
        deviceIdToDeviceTypeDiseaseSet.entrySet()) {
      if (!deviceIdToDefaultSpecimen.containsKey(entry.getKey())) {
        log.warn(
            "AIMS STLT Testing: Skipping DeviceTypeDisease {} because no swab types are configured",
            entry.getKey());
        continue;
      }
      AimsDeviceSpecimen defaultSpecimen = deviceIdToDefaultSpecimen.get(entry.getKey());
      SpecimenInput specimen = generateFakeSpecimen(defaultSpecimen, dateTested);

      for (String resultSnomed : List.of(DETECTED_SNOMED, NOT_DETECTED_SNOMED, INVALID_SNOMED)) {
        List<TestDetailsInput> testDetails =
            generateListOfFakeTestDetails(entry.getValue(), resultSnomed, dateTested);

        try {
          ORU_R01 hl7Message =
              hl7Converter.createLabReportMessage(
                  patient,
                  provider,
                  facility,
                  facility,
                  specimen,
                  testDetails,
                  gitProperties,
                  "T",
                  UUID.randomUUID().toString(),
                  TestCorrectionStatus.ORIGINAL);
          messagesForJurisdiction.add(parser.encode(hl7Message));
        } catch (HL7Exception | IllegalArgumentException e) {
          throw new RuntimeException(e);
        }
      }
    }

    return messagesForJurisdiction;
  }

  private PatientReportInput generateFakePatient(AimsJurisdiction jurisdiction) {
    return PatientReportInput.builder()
        .firstName("John")
        .middleName("")
        .lastName("Patient")
        .email("testPatient@example.com")
        .phone("7165551234")
        .street("123 Patient St")
        .streetTwo("Apt 101")
        .city("Patient City")
        .state(jurisdiction.state())
        .zipCode(jurisdiction.zipcode())
        .country("USA")
        .dateOfBirth(LocalDate.of(1900, 1, 1))
        .patientInternalId(UUID.randomUUID().toString())
        .sex("M")
        .race("Other")
        .build();
  }

  private ProviderReportInput generateFakeProvider(AimsJurisdiction jurisdiction) {
    return ProviderReportInput.builder()
        .firstName("Jane")
        .middleName("")
        .lastName("Provider")
        .npi("0123456789")
        .street("234 Provider St")
        .streetTwo("Suite 202")
        .city("Provider City")
        .state(jurisdiction.state())
        .zipCode(jurisdiction.zipcode())
        .phone("7165552345")
        .email("testProvider@example.com")
        .build();
  }

  private FacilityReportInput generateFakeFacility(AimsJurisdiction jurisdiction) {
    return FacilityReportInput.builder()
        .name(testFacilityName)
        .clia(testFacilityClia)
        .street("456 Facility St")
        .streetTwo("Suite 303")
        .city("Facility City")
        .state(jurisdiction.state())
        .zipCode(jurisdiction.zipcode())
        .phone("7165553456")
        .email("testFacility@example.com")
        .build();
  }

  private SpecimenInput generateFakeSpecimen(
      AimsDeviceSpecimen aimsDeviceSpecimen, Date dateTested) {
    return SpecimenInput.builder()
        .snomedTypeCode(aimsDeviceSpecimen.getSpecimenTypeCode())
        .snomedDisplay(aimsDeviceSpecimen.getSpecimenTypeName())
        .collectionDate(dateTested)
        .receivedDate(dateTested)
        .collectionBodySiteCode(aimsDeviceSpecimen.getSpecimenCollectionLocationCode())
        .collectionBodySiteName(aimsDeviceSpecimen.getSpecimenCollectionLocationName())
        .build();
  }

  private List<TestDetailsInput> generateListOfFakeTestDetails(
      Set<DeviceTypeDisease> deviceTypeDiseases, String resultValue, Date dateTested) {
    List<TestDetailsInput> testDetails = new ArrayList<>();

    for (DeviceTypeDisease deviceTypeDisease : deviceTypeDiseases) {
      testDetails.add(generateFakeTestDetails(deviceTypeDisease, resultValue, dateTested));
    }
    return testDetails;
  }

  private TestDetailsInput generateFakeTestDetails(
      DeviceTypeDisease deviceTypeDisease, String resultValue, Date dateTested) {
    return TestDetailsInput.builder()
        .condition(null)
        .testOrderLoinc(deviceTypeDisease.getTestOrderedLoincCode())
        .testOrderDisplayName(deviceTypeDisease.getTestOrderedLoincLongName())
        .testPerformedLoinc(deviceTypeDisease.getTestPerformedLoincCode())
        .testPerformedLoincLongCommonName(deviceTypeDisease.getTestPerformedLoincLongName())
        .resultType(ResultScaleType.ORDINAL)
        .resultValue(resultValue)
        .resultDate(dateTested)
        .build();
  }
}
