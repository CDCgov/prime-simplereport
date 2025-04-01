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
import org.hl7.fhir.r4.model.Bundle;
import org.springframework.boot.info.GitProperties;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UniversalReportService {
  private final FhirConverter fhirConverter;
  private final GitProperties gitProperties;
  private final FhirContext fhirContext;

  public String processLabReport(
      PatientReportInput patientInput,
      ProviderReportInput providerInput,
      FacilityReportInput facilityInput,
      SpecimenInput specimenInput,
      List<TestDetailsInput> testDetailsInputList) {
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
