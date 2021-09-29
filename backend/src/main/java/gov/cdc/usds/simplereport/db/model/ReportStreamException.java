package gov.cdc.usds.simplereport.db.model;

import java.util.Date;
import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.MapsId;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.annotation.CreatedDate;

@Entity
@RequiredArgsConstructor
public class ReportStreamException {
  @Id @NonNull private UUID testEventInternalId;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId
  private TestEvent testEvent;

  /** If it's not an error, it's a warning */
  @NonNull private Boolean isError;

  @NonNull private String details;

  @Column(updatable = false)
  @CreatedDate
  private Date createdAt;

  /** Required by Hibernate */
  public ReportStreamException() {}
}
