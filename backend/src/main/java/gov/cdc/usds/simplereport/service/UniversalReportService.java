package gov.cdc.usds.simplereport.service;

import ca.uhn.fhir.context.FhirContext;
import gov.cdc.usds.simplereport.api.converter.FhirConverter;
import gov.cdc.usds.simplereport.api.model.universalreporting.FacilityReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.PatientReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.ProviderReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.SpecimenInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.TestDetailsInput;
import java.util.List;
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
}
