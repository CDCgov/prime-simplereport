package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import java.util.Date;
import java.util.UUID;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;

@Getter
@Setter
@Entity
public class FacilityLabTestOrder extends EternalAuditedEntity {
  @Column(nullable = false)
  @NonNull
  private UUID facilityId;

  @Column(nullable = false)
  @NonNull
  private UUID labId;

  @Column(nullable = false)
  @NonNull
  private String name;

  @Column(nullable = false)
  @NonNull
  private String description;

  @Column(updatable = false)
  @CreatedDate
  private Date createdAt;

  @Column(updatable = false)
  private Date updatedAt;
}
