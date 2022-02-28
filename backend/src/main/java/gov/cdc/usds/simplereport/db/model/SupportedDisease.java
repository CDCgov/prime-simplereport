package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/** A disease that SimpleReport supports testing for. */
@Entity
@EntityListeners(AuditingEntityListener.class)
@RequiredArgsConstructor
@Getter
public class SupportedDisease extends IdentifiedEntity {

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String loinc;
}
