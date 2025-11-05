package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Getter;
import org.hibernate.annotations.Type;

@Entity
public class PatientAnswers extends AuditedEntity {
  @Column
  @Type(JsonBinaryType.class)
  private AskOnEntrySurvey askOnEntry;

  @JsonIgnore @Column @Getter private Boolean piiDeleted;

  protected PatientAnswers() {
    /* for hibernate */
  }

  public PatientAnswers(AskOnEntrySurvey ask_on_entry) {
    this.askOnEntry = ask_on_entry;
  }

  public AskOnEntrySurvey getSurvey() {
    return askOnEntry;
  }

  public void setSurvey(AskOnEntrySurvey askOnEntry) {
    this.askOnEntry = askOnEntry;
  }
}
