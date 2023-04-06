package gov.cdc.usds.simplereport.db.model.auxiliary;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SmsStatusCallback {
  private final String messageStatus;
  private final String messageSid;

  private final String errorCode;
  private final String number;

  public SmsStatusCallback(
      @JsonProperty("MessageStatus") String messageStatus,
      @JsonProperty("MessageSid") String messageSid,
      @JsonProperty("ErrorCode") String errorCode,
      @JsonProperty("To") String number) {

    this.messageStatus = messageStatus;
    this.messageSid = messageSid;
    this.errorCode = errorCode;
    this.number = number;
  }

  public String getMessageStatus() {
    return messageStatus;
  }

  public String getMessageSid() {
    return messageSid;
  }

  public String getErrorCode() {
    return errorCode;
  }

  public String getNumber() {
    return number;
  }
}
