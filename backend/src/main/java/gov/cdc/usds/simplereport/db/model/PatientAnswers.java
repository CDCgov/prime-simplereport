package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.OneToOne;
import org.hibernate.annotations.Type;

import java.util.UUID;

@Entity
public class PatientAnswers extends AuditedEntity {

  @Column
  @Type(type = "jsonb")
  private AskOnEntrySurvey askOnEntry;

  @OneToOne(mappedBy = "askOnEntrySurvey")
  private TestOrder testOrder;

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

  public UUID getTestOrderId() {
    return testOrder.getInternalId();
  }
}
