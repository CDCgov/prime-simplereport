package gov.cdc.usds.simplereport.api.converter;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import java.util.Date;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ConvertToObservationProps {
  private String diseaseCode;
  private String diseaseName;
  private String resultCode;
  private TestCorrectionStatus correctionStatus;
  private String correctionReason;
  private String id;
  private String resultDescription;
  private String testkitNameId;
  private String equipmentUid;
  private String deviceModel;
  private Date issued;
}
