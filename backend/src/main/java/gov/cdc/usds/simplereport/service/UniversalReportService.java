package gov.cdc.usds.simplereport.service;

import ca.uhn.fhir.context.FhirContext;
import gov.cdc.usds.simplereport.api.converter.FhirConverter;
import gov.cdc.usds.simplereport.api.model.universalreporting.FacilityReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.PatientReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.ProviderReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.SpecimenInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.TestDetailsInput;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Provider;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hl7.fhir.r4.model.Bundle;
import org.springframework.boot.info.GitProperties;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UniversalReportService {
  private final FhirConverter fhirConverter;
  private final GitProperties gitProperties;
  private final FhirContext fhirContext;
  private final OrganizationService organizationService;

  // TODO: Maybe not right away but at some point we could have a service that generates an audit
  // trail of the bundle.We can track the bundle creation and keep a log of why the report is
  // failing w.o store the data in the bundle
  // TODO: Add validation layer + error handling to ensure relationships between resources exist and
  // check missing specimen types loinc codes
  public String processLabReport(
      PatientReportInput patientInput,
      ProviderReportInput providerInput,
      FacilityReportInput facilityInput,
      SpecimenInput specimenInput,
      List<TestDetailsInput> testDetailsInputList) {
    Organization currentOrg = organizationService.getCurrentOrganization();
    List<Facility> orgFacilities = organizationService.getFacilities(currentOrg);
    // TODO: Test facility and provider matching logic
    UUID matchedFacilityId = findMatchingFacilityId(facilityInput, orgFacilities);
    facilityInput.setInternalId(matchedFacilityId != null ? matchedFacilityId : UUID.randomUUID());

    UUID matchedProviderId = findMatchingProviderId(providerInput, orgFacilities);
    providerInput.setInternalId(matchedProviderId != null ? matchedProviderId : UUID.randomUUID());
    // TODO: test for error handling
    Bundle bundle =
        fhirConverter.createUniversalFhirBundle(
            patientInput,
            providerInput,
            facilityInput,
            specimenInput,
            testDetailsInputList,
            gitProperties,
            "P");
    var parser = fhirContext.newJsonParser();
    return parser.encodeResourceToString(bundle);
  }

  private UUID findMatchingFacilityId(
      FacilityReportInput facilityInput, List<Facility> orgFacilities) {
    UUID facilityUUID = null;
    List<Facility> matchedFacilities =
        orgFacilities.stream()
            .filter(f -> f.getCliaNumber().equals(facilityInput.getClia()) && !f.getIsDeleted())
            .toList();

    if (!matchedFacilities.isEmpty()) {
      facilityUUID = matchedFacilities.get(0).getInternalId();
    }
    if (matchedFacilities.size() > 1) {
      matchedFacilities =
          matchedFacilities.stream()
              .filter(f -> f.getAddress().getStreetOne().equals(facilityInput.getStreet()))
              .toList();
      if (!matchedFacilities.isEmpty()) {
        facilityUUID = matchedFacilities.get(0).getInternalId();
      } else {
        log.info(
            "Found {} matching facilities during uELR FHIR processing. Using the first internal id.",
            matchedFacilities.size());
      }
    }
    return facilityUUID;
  }

  private UUID findMatchingProviderId(
      ProviderReportInput providerInput, List<Facility> orgFacilities) {
    UUID providerUUID = null;
    List<Provider> providers =
        orgFacilities.stream()
            .map(Facility::getOrderingProvider)
            .filter(p -> p.getProviderId().equals(providerInput.getNpi()))
            .toList();
    if (providers.size() == 1) {
      providerUUID = providers.get(0).getInternalId();
    }
    return providerUUID;
  }
}
