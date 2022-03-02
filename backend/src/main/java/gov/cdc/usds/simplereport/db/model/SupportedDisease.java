package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.boot.context.properties.ConstructorBinding;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/** A disease that SimpleReport supports testing for. */
@Entity
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor
@Getter
public class SupportedDisease extends EternalAuditedEntity {

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String loinc;

  @ConstructorBinding
  public SupportedDisease(String name, String loinc) {
    this();
    this.name = name;
    this.loinc = loinc;
  }
}
