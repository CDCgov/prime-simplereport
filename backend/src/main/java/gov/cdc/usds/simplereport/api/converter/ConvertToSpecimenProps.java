package gov.cdc.usds.simplereport.api.converter;

import java.time.ZonedDateTime;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ConvertToSpecimenProps {
  private String specimenCode;
  private String specimenName;
  private String collectionCode;
  private String collectionName;
  private String id;
  private String identifier;
  private ZonedDateTime collectionDate;
  private ZonedDateTime receivedTime;
}
