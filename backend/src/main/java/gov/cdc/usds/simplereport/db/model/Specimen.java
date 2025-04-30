package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
public class Specimen extends EternalAuditedEntity {

  @Column(nullable = false)
  private String loincSystemCode;

  @Column(nullable = false)
  private String loincSystemDisplay;

  @Column(nullable = false)
  private String snomedCode;

  @Column(nullable = false)
  private String snomedDisplay;
}
