package gov.cdc.usds.simplereport.db.model.auxiliary;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class SmsStatusCallback {
  private final String to;
  private final String accountSid;
  private final String apiVersion;
  private final String smsSid;
  private final String from;
  private final String messageStatus;
  private final String messageSid;
  private final String smsStatus;

  @JsonCreator
  public SmsStatusCallback(
      @JsonProperty("To") String to,
      @JsonProperty("AccountSid") String accountSid,
      @JsonProperty("ApiVersion") String apiVersion,
      @JsonProperty("MessageStatus") String messageStatus,
      @JsonProperty("SmsSid") String smsSid,
      @JsonProperty("From") String from,
      @JsonProperty("MessageSid") String messageSid,
      @JsonProperty("SmsStatus") String smsStatus) {
    this.to = to;
    this.accountSid = accountSid;
    this.apiVersion = apiVersion;
    this.smsSid = smsSid;
    this.from = from;
    this.messageStatus = messageStatus;
    this.messageSid = messageSid;
    this.smsStatus = smsStatus;
  }

  public String getTo() {
    return to;
  }

  public String getAccountSid() {
    return accountSid;
  }

  public String getApiVersion() {
    return apiVersion;
  }

  public String getSmsSid() {
    return smsSid;
  }

  public String getSmsStatus() {
    return smsStatus;
  }

  public String getFrom() {
    return from;
  }

  public String getMessageStatus() {
    return messageStatus;
  }

  public String getMessageSid() {
    return messageSid;
  }
}
