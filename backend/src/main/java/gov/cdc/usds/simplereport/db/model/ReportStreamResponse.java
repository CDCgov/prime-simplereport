package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;
import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.Id;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
@RequiredArgsConstructor
@NoArgsConstructor
public class ReportStreamResponse {
  /** This is foreign-keyed to TestEvent.internal_id */
  @JsonProperty @NonNull @Id private UUID testEventInternalId;

  /** If it's not an error, it's a warning */
  @JsonProperty @NonNull private Boolean isError;

  @JsonProperty @NonNull private String details;

  @Column(updatable = false)
  @CreatedDate
  private Date createdAt;
}
