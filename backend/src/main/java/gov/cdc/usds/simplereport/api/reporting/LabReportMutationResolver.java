package gov.cdc.usds.simplereport.api.reporting;

import gov.cdc.usds.simplereport.api.model.universalreporting.FacilityReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.PatientReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.ProviderReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.SpecimenInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.TestDetailsInput;
import gov.cdc.usds.simplereport.service.UniversalReportService;
import java.util.List;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
public class LabReportMutationResolver {

  @MutationMapping
  public String submitLabReport(
      @Argument PatientReportInput patient,
      @Argument ProviderReportInput provider,
      @Argument FacilityReportInput facility,
      @Argument SpecimenInput specimen,
      @Argument List<TestDetailsInput> testDetailsList) {
    return "Thanks!";
  }
}
