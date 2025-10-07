package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeviceMigrationService {

  private final DeviceTypeRepository deviceTypeRepository;
  private final FacilityRepository facilityRepository;
  private final SpecimenTypeRepository specimenTypeRepository;

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

  List<SpecimenEntry> specimenEntries =
      List.of(
          new SpecimenEntry("Anterior nares swab", "697989009"),
          new SpecimenEntry("Mid-turbinate nasal swab", "871810001"),
          new SpecimenEntry("Nasopharyngeal swab", "258500001"),
          new SpecimenEntry("Throat swab", "258529004"),
          new SpecimenEntry("Nasopharyngeal washings", "258467004"),
          new SpecimenEntry("Nasopharyngeal aspirate", "258411007"),
          new SpecimenEntry("Nasal aspirate specimen", "429931000124105"),
          new SpecimenEntry("Swab of internal nose", "445297001"),
          new SpecimenEntry("Nasopharyngeal and oropharyngeal swab", "433801000124107"),
          new SpecimenEntry("Serum specimen", "119364003"),
          new SpecimenEntry("Plasma specimen", "119361006"),
          new SpecimenEntry("Venous blood specimen", "122555007"),
          new SpecimenEntry("Bronchoalveolar lavage fluid sample", "258607008"),
          new SpecimenEntry("Whole blood sample", "258580003"),
          new SpecimenEntry("Capillary blood specimen", "122554006"),
          new SpecimenEntry("Sputum specimen", "119334006"),
          new SpecimenEntry("Nasal washings", "433871000124101"),
          new SpecimenEntry("Oral saliva sample", "258560004"),
          new SpecimenEntry("Sputum specimen obtained by sputum induction", "258610001"),
          new SpecimenEntry("Coughed sputum specimen", "119335007"),
          new SpecimenEntry("Specimen from trachea obtained by aspiration", "445447003"),
          new SpecimenEntry("Lower respiratory fluid sample", "309171007"),
          new SpecimenEntry("Oral fluid specimen", "441620008"),
          new SpecimenEntry("Specimen obtained by bronchial aspiration", "441903006"),
          new SpecimenEntry("Exhaled air specimen", "119336008"),
          new SpecimenEntry("Dried blood spot specimen", "440500007"));

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public String updateSpecimenTypes() {

    ArrayList<String> log = new ArrayList<>();

    for (SpecimenEntry entry : specimenEntries) {
      Optional<SpecimenType> optionalSpecimenType =
          specimenTypeRepository.findByTypeCode(entry.loinc);

      if (optionalSpecimenType.isPresent()) {
        SpecimenType specimenType = optionalSpecimenType.get();

        if (!specimenType.getName().equals(entry.name)) {
          log.add(
              "* setting specimenType name from: '"
                  + specimenType.getName()
                  + "' to: '"
                  + entry.name
                  + "'");
          specimenType.setName(entry.name);
          specimenTypeRepository.save(specimenType);
        } else {
          log.add("= " + specimenType.getName() + " was left unchanged");
        }
      } else {
        specimenTypeRepository.save(new SpecimenType(entry.name, entry.loinc));
        log.add("+ created specimenType name: " + entry.name + " typecode: " + entry.loinc);
      }
    }

    return String.join("\n", log);
  }

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

  public record SpecimenEntry(String name, String loinc) {}
}
