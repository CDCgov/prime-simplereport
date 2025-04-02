package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
public class ConditionLabJoin extends EternalAuditedEntity {

  @Column(nullable = false)
  private UUID conditionId;

  @Column(nullable = false)
  private UUID labID;

  public ConditionLabJoin(UUID conditionId, UUID labID) {
    super();
    this.conditionId = conditionId;
    this.labID = labID;
  }

  protected ConditionLabJoin() {
    /* for hibernate */
  }
}
