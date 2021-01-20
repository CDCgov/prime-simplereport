package gov.cdc.usds.simplereport.db.model;

import javax.persistence.AttributeOverride;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@AttributeOverride(name = "result", column = @Column(nullable = false))
public class PatientLink extends EternalEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "test_order_id", nullable = false)
    private TestOrder order;

    public PatientLink() {
    }

    public PatientLink(TestOrder order) {
        this.order = order;
    }

    public TestOrder getTestOrder() {
        return order;
    }
}
