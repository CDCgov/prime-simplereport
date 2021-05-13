package gov.cdc.usds.simplereport.db.model.auxiliary;

import java.util.Objects;

public class PhoneNumberInput {
  String type;
  String number;

  public PhoneNumberInput() {}

  public PhoneNumberInput(String type, String number) {
    this.type = type;
    this.number = number;
  }

  public String getType() {
    return type;
  }

  public String getNumber() {
    return number;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    PhoneNumberInput that = (PhoneNumberInput) o;
    return Objects.equals(number, that.number) && Objects.equals(type, that.type);
  }

  @Override
  public int hashCode() {
    return Objects.hash(type, number);
  }
}
