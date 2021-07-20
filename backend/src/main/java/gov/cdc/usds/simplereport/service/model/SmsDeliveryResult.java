package gov.cdc.usds.simplereport.service.model;

public class SmsDeliveryResult {
  private String messageId;
  private Exception exception;

  public SmsDeliveryResult(String messageId, Exception exception) {
    super();
    this.messageId = messageId;
    this.exception = exception;
  }

  public String getMessageId() {
    return messageId;
  }

  public Exception getException() {
    return exception;
  }
}
