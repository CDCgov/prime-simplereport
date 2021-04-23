package gov.cdc.usds.simplereport.db.model.auxiliary;

public class PhoneNumberInput {
  String type;
  String number;

  public PhoneNumberInput() {}

  public PhoneNumberInput(String number) {
    this.number = number;
  }

  public String getType() {
    return type;
  }

  public String getNumber() {
    return number;
  }
}
