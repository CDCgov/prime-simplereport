package gov.cdc.usds.simplereport.db.model.auxiliary;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class SmsStatusCallback {
  private final String smsSid;
  private final String smsStatus;
  private final String messageStatus;
  private final String messageSid;

  @JsonCreator
  public SmsStatusCallback(
      @JsonProperty("SmsSid") String smsSid,
      @JsonProperty("SmsStatus") String smsStatus,
      @JsonProperty("MessageStatus") String messageStatus,
      @JsonProperty("MessageSid") String messageSid) {
    this.smsSid = smsSid;
    this.smsStatus = smsStatus;
    this.messageStatus = messageStatus;
    this.messageSid = messageSid;
  }

  public String getSmsSid() {
    return smsSid;
  }

  public String getSmsStatus() {
    return smsStatus;
  }

  public String getMessageStatus() {
    return messageStatus;
  }

  public String getMessageSid() {
    return messageSid;
  }
}
