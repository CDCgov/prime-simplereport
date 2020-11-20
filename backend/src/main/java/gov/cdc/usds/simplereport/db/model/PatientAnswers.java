package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Entity;

import org.hibernate.annotations.Type;

import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;

@Entity
public class PatientAnswers extends AuditedEntity {

	@Column
	@Type(type = "jsonb")
	private AskOnEntrySurvey askOnEntry;

	protected PatientAnswers() { /* for hibernate */}

	public PatientAnswers(AskOnEntrySurvey ask_on_entry) {
		this.askOnEntry = ask_on_entry;
	}

	public AskOnEntrySurvey getSurvey() {
		return askOnEntry;
	}
}
