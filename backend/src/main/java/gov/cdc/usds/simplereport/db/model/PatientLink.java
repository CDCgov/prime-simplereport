package gov.cdc.usds.simplereport.db.model;

import java.time.Instant;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;

@Entity
public class PatientLink extends EternalEntity {

    @OneToOne(optional = false)
    @JoinColumn(name = "test_order_id", nullable = false)
    private TestOrder testOrder;

    @Column
    private Date refreshedAt;

    public PatientLink() {
    }

    public PatientLink(TestOrder testOrder) {
        this.testOrder = testOrder;
    }

    public TestOrder getTestOrder() {
        return testOrder;
    }

    public Date getRefreshedAt() {
        if (refreshedAt == null) {
            return getCreatedAt();
        }
        return refreshedAt;
    }

    public void refresh() {
        this.refreshedAt = Date.from(Instant.now());
    }
}
