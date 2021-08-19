package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.OneToOne;
import org.hibernate.annotations.Type;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Entity
public class PatientAnswers extends AuditedEntity {
  private static final Logger LOG = LoggerFactory.getLogger(PatientAnswers.class);

  @Column
  @Type(type = "jsonb")
  private AskOnEntrySurvey askOnEntry;

  /** This relationship is necessary for PatientAnswersRepository.findAllByTestOrderInternalIdIn */
  @OneToOne(mappedBy = "askOnEntrySurvey", fetch = FetchType.LAZY)
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
}
