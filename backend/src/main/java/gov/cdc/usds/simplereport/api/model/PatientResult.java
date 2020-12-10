package gov.cdc.usds.simplereport.api.model;

import java.util.Date;
import java.util.UUID;

import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;

public class PatientResult {

    private TestEvent event;

    public PatientResult(TestEvent event) {
        super();
        this.event = event;
    }

    public Date getDateTested() {
        return event.getCreatedAt();
    }

    public TestResult getResult() {
        return event.getResult();
    }

    public UUID getInternalId() {
        return event.getInternalId();
    }

    public UUID getId() {
        return getInternalId();
    }
}
