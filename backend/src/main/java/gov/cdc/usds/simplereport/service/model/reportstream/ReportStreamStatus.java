package gov.cdc.usds.simplereport.service.model.reportstream;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum ReportStreamStatus {
  @JsonProperty("Error")
  ERROR,
  @JsonProperty("Received")
  RECEIVED,
  @JsonProperty("Not Delivering")
  NOT_DELIVERING,
  @JsonProperty("Waiting to Deliver")
  WAITING_TO_DELIVER,
  @JsonProperty("Partially Delivered")
  PARTIALLY_DELIVERED,
  @JsonProperty("Delivered")
  DELIVERED;
}
