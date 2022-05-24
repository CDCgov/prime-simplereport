package gov.cdc.usds.simplereport.service.model.auxiliary;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.db.model.auxiliary.SmsStatusCallback;
import org.junit.jupiter.api.Test;

class SmsStatusCallbackTest {

  @Test
  void construction_validInputs_expectedOutputs() {
    String status = "delivered";
    String messageId = "123";
    String number = "(123) 456-7890";
    String errorCode = "30060";
    SmsStatusCallback smsStatus = new SmsStatusCallback(status, messageId, errorCode, number);
    assertEquals(status, smsStatus.getMessageStatus());
    assertEquals(messageId, smsStatus.getMessageSid());
    assertEquals(errorCode, smsStatus.getErrorCode());
    assertEquals(number, smsStatus.getNumber());
  }
}
