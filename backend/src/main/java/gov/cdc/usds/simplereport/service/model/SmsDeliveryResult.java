package gov.cdc.usds.simplereport.service.model;

public class SmsDeliveryResult {
  private String messageId;
  private Boolean deliverySuccess;

  public SmsDeliveryResult(String messageId, Boolean deliverySuccess) {
    super();
    this.messageId = messageId;
    this.deliverySuccess = deliverySuccess;
  }

  public String getMessageId() {
    return messageId;
  }

  public Boolean getDeliverySuccess() {
    return deliverySuccess;
  }
}
