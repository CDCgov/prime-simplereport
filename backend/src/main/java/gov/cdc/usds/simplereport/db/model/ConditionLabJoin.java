package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class ConditionLabJoin extends EternalAuditedEntity {

  @Column(nullable = false)
  private UUID conditionId;

  @Column(nullable = false)
  private UUID labId;

  public ConditionLabJoin(UUID conditionId, UUID labId) {
    super();
    this.conditionId = conditionId;
    this.labId = labId;
  }

  protected ConditionLabJoin() {
    /* for hibernate */
  }
}
