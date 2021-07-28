package gov.cdc.usds.simplereport.service.model;

public class SmsAPICallResult {
  private String telephone;
  private String messageId;
  private boolean deliverySuccess;

  public SmsAPICallResult(String telephone, String messageId, boolean deliverySuccess) {
    super();
    this.telephone = telephone;
    this.messageId = messageId;
    this.deliverySuccess = deliverySuccess;
  }

  public String getTelephone() {
    return telephone;
  }

  public String getMessageId() {
    return messageId;
  }

  public boolean getDeliverySuccess() {
    return deliverySuccess;
  }
}
