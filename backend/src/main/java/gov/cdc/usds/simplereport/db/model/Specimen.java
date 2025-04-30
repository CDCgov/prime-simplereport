package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Transient;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
@Entity
public class Specimen extends EternalAuditedEntity {

  @Column(nullable = false)
  @NonNull
  private String loincSystemCode;

  @Column(nullable = false)
  @NonNull
  private String loincSystemDisplay;

  @Column(nullable = false)
  @NonNull
  private String snomedCode;

  @Column(nullable = false)
  @NonNull
  private String snomedDisplay;

  @Transient private List<SpecimenBodySite> bodySiteList = new ArrayList<>();
}
