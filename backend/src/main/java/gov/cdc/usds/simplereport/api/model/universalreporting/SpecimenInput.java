package gov.cdc.usds.simplereport.api.model.universalreporting;

import java.util.Date;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SpecimenInput {
  private String typeSnomed;
  private Date collectionDate;
  private Date receivedDate;
  private String collectionLocationName;
  private String collectionLocationCode;
}
