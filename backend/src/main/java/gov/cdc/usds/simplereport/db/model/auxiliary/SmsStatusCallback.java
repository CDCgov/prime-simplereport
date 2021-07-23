package gov.cdc.usds.simplereport.db.model.auxiliary;

public class SmsStatusCallback {
  private final String to;
  private final String accountSid;
  private final String apiVersion;
  private final String smsSid;
  private final String from;
  private final String messageStatus;
  private final String messageSid;
  private final String smsStatus;

  public SmsStatusCallback(
      String To,
      String AccountSid,
      String ApiVersion,
      String MessageStatus,
      String SmsSid,
      String From,
      String MessageSid,
      String SmsStatus) {
    to = To;
    accountSid = AccountSid;
    apiVersion = ApiVersion;
    smsSid = SmsSid;
    from = From;
    messageStatus = MessageStatus;
    messageSid = MessageSid;
    smsStatus = SmsStatus;
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
