package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;

import org.hibernate.annotations.NaturalId;

import gov.cdc.usds.simplereport.validators.RequiredNumericCode;

/**
 * A SNOMED-registered specimen type that can be used by one or more
 * {@link DeviceType}s.
 */
public class SpecimenType extends EternalEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, updatable = false)
    @RequiredNumericCode
    @NaturalId
    private String typeCode;

    public SpecimenType(String name, String typeCode) {
        this.name = name;
        this.typeCode = typeCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTypeCode() {
        return typeCode;
    }

    public void setTypeCode(String typeCode) {
        this.typeCode = typeCode;
    }
}
