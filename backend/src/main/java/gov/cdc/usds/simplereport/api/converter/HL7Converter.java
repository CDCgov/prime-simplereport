package gov.cdc.usds.simplereport.api.converter;

import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.model.v251.group.ORU_R01_PATIENT_RESULT;
import ca.uhn.hl7v2.model.v251.message.ORU_R01;
import ca.uhn.hl7v2.model.v251.segment.PID;
import ca.uhn.hl7v2.model.v251.segment.SFT;
import java.io.IOException;
import java.util.UUID;
import org.springframework.boot.info.GitProperties;

public class HL7Converter {

  private static final String SIMPLE_REPORT_ORG_ID = "07640c5d-87cd-488b-9343-a226c5166539";

  public ORU_R01 createObservationMessage(GitProperties gitProperties)
      throws HL7Exception, IOException {
    ORU_R01 oru = new ORU_R01();

    // Populates Message Header (MSH) segment
    oru.initQuickstart("ORU", "R01", "T");

    SFT sft = oru.getSFT();
    // look into whether we should use SIMPLE_REPORT_ORG_ID here
    sft.getSft1_SoftwareVendorOrganization().getOrganizationName().setValue("SimpleReport");
    sft.getSft2_SoftwareCertifiedVersionOrReleaseNumber().setValue(gitProperties.getCommitId());
    sft.getSft3_SoftwareProductName().setValue("SimpleReport");
    sft.getSft4_SoftwareBinaryID().setValue(gitProperties.getCommitId());
    // make sure this is formatted to DTM format requirement
    sft.getSft6_SoftwareInstallDate()
        .getTs1_Time()
        .setValue(gitProperties.getCommitTime().toString());

    ORU_R01_PATIENT_RESULT patientResultGroup = oru.getPATIENT_RESULT();

    PID pid = patientResultGroup.getPATIENT().getPID();
    // v2.5.1 IG page 100, literal value: '1'
    pid.getPid1_SetIDPID().setValue("1");
    // patient ID
    pid.getPid2_PatientID().getCx1_IDNumber().setValue(UUID.randomUUID().toString());
    pid.getPid2_PatientID()
        .getCx4_AssigningAuthority()
        .getHd2_UniversalID()
        .setValue(SIMPLE_REPORT_ORG_ID);

    return oru;
  }
}
