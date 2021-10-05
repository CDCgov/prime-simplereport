package gov.cdc.usds.simplereport.db.model;

import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;
import lombok.Getter;

@MappedSuperclass
public class IdentifiedEntity implements DatabaseEntity {
  @Id
  @Getter
  @GeneratedValue(generator = "UUID4")
  @Column(updatable = false, nullable = false)
  private UUID internalId;
}
