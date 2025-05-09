package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import java.util.Date;
import java.util.UUID;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;

@Getter
@Setter
@Entity
public class FacilityLabTestOrderSpecimen {
  @Id
  @Getter
  @GeneratedValue(generator = "UUID4")
  @Column(updatable = false, nullable = false)
  private UUID internalId;

  @Column(nullable = false)
  @NonNull
  private UUID facilityLabTestOrderId;

  @Column(nullable = false)
  @NonNull
  private UUID specimenId;

  @Column(updatable = false)
  @CreatedDate
  private Date createdAt;

  @Column(updatable = true)
  private Date updatedAt;
}
