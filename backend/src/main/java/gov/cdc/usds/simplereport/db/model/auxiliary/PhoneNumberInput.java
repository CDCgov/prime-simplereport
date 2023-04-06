package gov.cdc.usds.simplereport.db.model.auxiliary;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Objects;
import org.springframework.graphql.data.method.annotation.Argument;

public class PhoneNumberInput {
  private String type;
  private String number;

  public PhoneNumberInput(
      @Argument @JsonProperty("type") String type,
      @Argument @JsonProperty("number") String number) {
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
