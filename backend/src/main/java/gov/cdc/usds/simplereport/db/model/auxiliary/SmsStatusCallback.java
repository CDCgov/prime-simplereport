package gov.cdc.usds.simplereport.db.model.auxiliary;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SmsStatusCallback {
  private final String messageStatus;
  private final String messageSid;

  public SmsStatusCallback(
      @JsonProperty("MessageStatus") String messageStatus,
      @JsonProperty("MessageSid") String messageSid) {
    this.messageStatus = messageStatus;
    this.messageSid = messageSid;
  }

  public String getMessageStatus() {
    return messageStatus;
  }

  public String getMessageSid() {
    return messageSid;
  }
}
