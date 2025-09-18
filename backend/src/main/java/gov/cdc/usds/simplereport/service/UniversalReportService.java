package gov.cdc.usds.simplereport.service;

import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.HapiContext;
import ca.uhn.hl7v2.model.v251.message.ORU_R01;
import ca.uhn.hl7v2.parser.Parser;
import gov.cdc.usds.simplereport.api.converter.HL7Converter;
import gov.cdc.usds.simplereport.api.converter.HapiContextProvider;
import gov.cdc.usds.simplereport.api.model.universalreporting.FacilityReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.PatientReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.ProviderReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.SpecimenInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.TestDetailsInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.info.GitProperties;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings({"checkstyle:TodoComment"})
public class UniversalReportService {
  private final HL7Converter hl7Converter;
  private final GitProperties gitProperties;
  private final HapiContext hapiContext = HapiContextProvider.get();
  private final Parser parser = hapiContext.getPipeParser();

  @Value("${simple-report.aims-processing-mode-code:T}")
  private String aimsProcessingModeCode = "T";

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
      List<TestDetailsInput> testDetailsInputList)
      throws HL7Exception {

    try {
      ORU_R01 message =
          hl7Converter.createLabReportMessage(
              patientInput,
              providerInput,
              facilityInput,
              null,
              specimenInput,
              testDetailsInputList,
              gitProperties,
              aimsProcessingModeCode,
              String.valueOf(UUID.randomUUID()),
              TestCorrectionStatus.ORIGINAL);
      return parser.encode(message);
    } catch (HL7Exception e) {
      log.error("Encountered an error converting the form data to HL7");
      throw e;
    }
  }
}
