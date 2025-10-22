package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import gov.cdc.usds.simplereport.api.model.ReportStreamCallbackRequest;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import java.util.Date;
import java.util.UUID;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
@RequiredArgsConstructor
@NoArgsConstructor
public class ReportStreamResponse extends IdentifiedEntity {
  /** This is foreign-keyed to TestEvent.internal_id */
  @NonNull private UUID testEventInternalId;

  /** If it's not an error, it's a warning */
  @NonNull private Boolean isError;

  @NonNull private String details;

  private String resolutionNote;

  private String queueName;

  @Column @JsonIgnore private Boolean piiDeleted;

  @Column(updatable = false)
  @CreatedDate
  private Date createdAt;

  public ReportStreamResponse(
      UUID testEventInternalId, Boolean isError, String details, String queueName) {
    this.testEventInternalId = testEventInternalId;
    this.isError = isError;
    this.details = details;
    this.queueName = queueName;
  }

  public static ReportStreamResponse from(ReportStreamCallbackRequest request) {
    return new ReportStreamResponse(
        request.getTestEventInternalId(),
        request.getIsError(),
        request.getDetails(),
        request.getQueueName());
  }
}
