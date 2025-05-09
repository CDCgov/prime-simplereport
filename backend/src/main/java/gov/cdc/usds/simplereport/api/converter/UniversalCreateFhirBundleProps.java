package gov.cdc.usds.simplereport.api.converter;

import java.util.Date;
import java.util.List;
import java.util.Set;
import lombok.Builder;
import lombok.Getter;
import org.hl7.fhir.r4.model.DiagnosticReport;
import org.hl7.fhir.r4.model.Observation;
import org.hl7.fhir.r4.model.Organization;
import org.hl7.fhir.r4.model.Patient;
import org.hl7.fhir.r4.model.Practitioner;
import org.hl7.fhir.r4.model.ServiceRequest;
import org.hl7.fhir.r4.model.Specimen;
import org.springframework.boot.info.GitProperties;

/** */
@Builder
@Getter
public class UniversalCreateFhirBundleProps {
  private Patient patient;
  private Organization testingLab;
  private Organization orderingFacility;
  private Practitioner practitioner;
  private Specimen specimen;
  private List<Observation> resultObservations;
  private Set<Observation> aoeObservations;
  private ServiceRequest serviceRequest;
  private DiagnosticReport diagnosticReport;
  private Date currentDate;
  private GitProperties gitProperties;
  private String processingId;
}
