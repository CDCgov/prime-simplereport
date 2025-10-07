package gov.cdc.usds.simplereport.db.model.auxiliary;

import static gov.cdc.usds.simplereport.api.Translators.parseState;
import static gov.cdc.usds.simplereport.api.Translators.parseString;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import javax.persistence.Column;
import javax.persistence.Embeddable;
import org.hibernate.annotations.Type;
import org.springframework.boot.context.properties.ConstructorBinding;

/** An embeddable address type for patients, facilities and providers. */
@Embeddable
public class StreetAddress {

  @Type(type = "list-array")
  @Column
  private List<String> street = new ArrayList<>();

  @Column private String city;
  @Column private String state;

  @JsonAlias({"zipCode", "zipcode"})
  @Column
  private String postalCode;

  @Column private String county;

  protected StreetAddress() {
    /* for hibernate */
  }

  public StreetAddress(
      List<String> street, String city, String state, String postalCode, String county) {
    if (street != null) {
      this.street.addAll(street);
    }
    this.city = city;
    this.state = state;
    this.postalCode = postalCode;
    this.county = county;
  }

  /** Convenience constructor for situations where we have a two-line address already */
  @ConstructorBinding
  public StreetAddress(
      String street1, String street2, String city, String state, String postalCode, String county) {
    this(null, city, state, postalCode, county);
    if (street1 != null && !street1.isEmpty()) {
      street.add(street1);
    }
    if (street2 != null && !street2.isEmpty()) {
      street.add(street2);
    }
  }

  public List<String> getStreet() {
    return Collections.unmodifiableList(street);
  }

  @JsonIgnore
  public String getStreetOne() { // if we're gonna do this, let's do it in one place
    return street == null || street.isEmpty() ? "" : street.get(0);
  }

  @JsonIgnore
  public String getStreetTwo() { // vide supra
    return street == null || street.size() < 2 ? "" : street.get(1);
  }

  public void setStreet(String street1, String street2) {
    street.clear();
    if (street1 != null && !street1.isEmpty()) {
      street.add(street1);
    }
    if (street2 != null && !street2.isEmpty()) {
      street.add(street2);
    }
  }

  public String getCity() {
    return city;
  }

  public void setCity(String city) {
    this.city = city;
  }

  public String getState() {
    return state;
  }

  public void setState(String state) {
    this.state = state;
  }

  public String getPostalCode() {
    return postalCode;
  }

  public void setPostalCode(String postalCode) {
    this.postalCode = postalCode;
  }

  public String getCounty() {
    return county;
  }

  public void setCounty(String county) {
    this.county = county;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    StreetAddress that = (StreetAddress) o;
    return Objects.equals(street, that.street)
        && Objects.equals(city, that.city)
        && Objects.equals(state, that.state)
        && Objects.equals(postalCode, that.postalCode)
        && Objects.equals(county, that.county);
  }

  @Override
  public int hashCode() {
    return Objects.hash(street, city, state, postalCode, county);
  }

  public static StreetAddress deAndReSerializeForSafety(StreetAddress address) {
    String streetOne = parseString(address.getStreetOne());
    String streetTwo = parseString(address.getStreetTwo());
    String city = parseString(address.getCity());
    String state = parseState(address.getState());
    String postal = parseString(address.getPostalCode());
    String county = parseString(address.getCounty());
    return new StreetAddress(streetOne, streetTwo, city, state, postal, county);
  }
}
