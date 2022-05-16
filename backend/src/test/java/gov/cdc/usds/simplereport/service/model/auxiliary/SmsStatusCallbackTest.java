package gov.cdc.usds.simplereport.service.model.auxiliary;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.db.model.auxiliary.SmsStatusCallback;
import org.junit.jupiter.api.Test;

public class SmsStatusCallbackTest {

  @Test
  void construction_validInputs_expectedOutputs() {
    String status = "delivered";
    String messageId = "123";
    String number = "(123) 456-7890";
    String errorCode = "30060";
    SmsStatusCallback smsStatus = new SmsStatusCallback(status, messageId, errorCode, number);
    assertEquals(smsStatus.getMessageStatus(), status);
    assertEquals(smsStatus.getMessageSid(), messageId);
    assertEquals(smsStatus.getErrorCode(), errorCode);
    assertEquals(smsStatus.getNumber(), number);
  }
}
