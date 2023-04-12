package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeviceMigrationService {

  private final DeviceTypeRepository deviceTypeRepository;
  private final FacilityRepository facilityRepository;

  List<Pair> duplicateDevices =
      List.of(
          new Pair(
              "Abbott Alinity M - Flu + COVID-19 (RT-PCR)", "Abbott Alinity M - COVID-19 (RT-PCR)"),
          new Pair(
              "BD Veritor System - Flu + COVID-19 Antigen",
              "BD Veritor System - COVID-19 (Antigen)"),
          new Pair("Access Bio CareStart Home Test (Antigen)", "On/Go COVID-19 Antigen Self-Test"),
          new Pair("Access Bio CareStart (Antigen)", "CareStart COVID-19 (Antigen)"),
          new Pair(
              "GeneFinder COVID-19 Plus RealAmp Kit (RT-PCR)",
              "OSANG GeneFinder Plus RealAmp Kit (RT-PCR)"),
          new Pair(
              "iAMP COVID-19 Detection Kit (RT-PCR)", "Atila iAMP COVID-19 Detection Kit (RT-PCR)"),
          new Pair(
              "CDC Influenza Multiplex Assay - Flu + COVID19 - (RT-PCR)",
              "CDC Influenza Multiplex Assay - COVID19 (RT-PCR)"),
          new Pair("Quidel Sofia 2 Multiplex (Antigen)", "Quidel Sofia 2 (Antigen)"),
          new Pair("Sofia SARS FIA (Antigen)", "Quidel Sofia SARS (Antigen)"),
          new Pair("Cepheid Xpert Xpress (RT-PCR)", "GeneXpert Xpress (RT-PCR)"),
          new Pair("Xpert Xpress - Flu + COVID-19 (RT-PCR)", "Xpert Xpress - COVID-19 (RT-PCR)"));

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public void mergeDuplicateDevices() {

    // load the duplicate devices

    for (Pair pair : duplicateDevices) {
      DeviceType original = deviceTypeRepository.findDeviceTypeByName(pair.original);
      DeviceType duplicate = deviceTypeRepository.findDeviceTypeByName(pair.duplicate);

      if (original == null || duplicate == null) {
        continue;
      }

      // assign the facilities with the old device with the replacement devices
      Set<Facility> facilitiesUsingDuplicateDevice = facilityRepository.findByDeviceType(duplicate);
      for (Facility facility : facilitiesUsingDuplicateDevice) {
        facility.removeDeviceType(duplicate);
        facility.addDeviceType(original);
        facilityRepository.save(facility);
      }

      // delete one of the duplicates
      duplicate.setIsDeleted(true);
      deviceTypeRepository.save(duplicate);
    }
  }

  public record Pair(String original, String duplicate) {}
}
