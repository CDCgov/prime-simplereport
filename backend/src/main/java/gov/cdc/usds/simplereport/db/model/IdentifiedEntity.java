package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import java.util.UUID;
import lombok.Getter;

@MappedSuperclass
public class IdentifiedEntity implements DatabaseEntity {
  @Id
  @Getter
  @GeneratedValue(generator = "UUID4")
  @Column(updatable = false, nullable = false)
  private UUID internalId;
}
