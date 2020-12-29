package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.config.simplereport.DataHubConfig;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;
import org.jetbrains.annotations.NotNull;
import org.springframework.boot.context.properties.ConstructorBinding;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.ReadOnlyProperty;

import javax.persistence.*;
import java.util.Date;
import java.util.UUID;

@Entity
@DynamicUpdate
public class DataHubUpload {

    @Transient
    static public final String SUCCESS_JOB = "SUCCESS";

    protected DataHubUpload() { /* no-op for hibernate */ }

    // We have to pass config into the constructor because Configuration doesn't work in constructors
    @ConstructorBinding
    public DataHubUpload(@NotNull DataHubConfig _config) {
        createdBy = UUID.fromString(_config.getServiceUuid());
        updatedBy = createdBy;
        jobState = "INIT";
        recordsProcessed = 0;
        responseData = "{}";
        earliestRecordedTimestamp = _config.EARLIEST_DATE;
        latestRecordedTimestamp = _config.EARLIEST_DATE;
    }

    @Column(updatable = false, nullable = false)
    @Id
    @GeneratedValue(generator = "UUID4")
    private UUID internalId;

    // set to "SUCCESS" when done.
    @Column(nullable = false)
    private String jobState;

    @Column(updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    private Date createdAt;

    @Column(updatable = false)
    @ReadOnlyProperty
    private UUID createdBy;

    @Column
    @Temporal(TemporalType.TIMESTAMP)
    @UpdateTimestamp
    private Date updatedAt;

    @Column
    private UUID updatedBy;

    @Column
    private int recordsProcessed;

    @Column
    @LastModifiedDate
    @Temporal(TemporalType.TIMESTAMP)
    private Date earliestRecordedTimestamp;

    @Column
    @LastModifiedDate
    @Temporal(TemporalType.TIMESTAMP)
    private Date latestRecordedTimestamp;

    @Column
    private int httpResponse;

    @Column
    @Type(type = "jsonb")
    private String responseData;

    public UUID getInternalId() {
        return internalId;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public Date getUpdatedAt() { return updatedAt; }

    public String getJobState() {
        return jobState;
    }

    public DataHubUpload setJobState(String jobState) {
        this.jobState = jobState;
        return this;
    }

    public int getRecordsProcessed() {
        return recordsProcessed;
    }

    public DataHubUpload setRecordsProcessed(int recordsProcessed) {
        this.recordsProcessed = recordsProcessed;
        return this;
    }

    public Date getEarliestRecordedTimestamp() {
        return earliestRecordedTimestamp;
    }

    public DataHubUpload setEarliestRecordedTimestamp(Date earliestRecordedTimestamp) {
        this.earliestRecordedTimestamp = earliestRecordedTimestamp;
        return this;
    }

    public Date getLatestRecordedTimestamp() {
        return latestRecordedTimestamp;
    }

    public DataHubUpload setLatestRecordedTimestamp(Date latestRecordedTimestamp) {
        this.latestRecordedTimestamp = latestRecordedTimestamp;
        return this;
    }

    public int getHttpResponse() {
        return httpResponse;
    }

    public DataHubUpload setHttpResponse(int httpResponse) {
        this.httpResponse = httpResponse;
        return this;
    }

    public String getResponseData() {
        return responseData;
    }

    public DataHubUpload setResponseData(String responseData) {
        this.responseData = responseData;
        return this;
    }
}
