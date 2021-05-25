package gov.cdc.usds.simplereport.validators;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.errors.OrderingProviderRequiredException;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.properties.OrderingProviderProperties;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class OrderingProviderRequiredValidatorTest {

  private OrderingProviderRequiredValidator validator;

  private final List<String> bypassedStates = List.of("ND", "MD");
  private final PersonName empty = new PersonName("", "", "", "");
  private final PersonName boba = new PersonName("Boba", "", "Fett", "");

  @BeforeEach
  void init() {
    OrderingProviderProperties properties = mock(OrderingProviderProperties.class);
    when(properties.getStatesNotRequired()).thenReturn(bypassedStates);
    validator = new OrderingProviderRequiredValidator(properties);
  }

  @Test
  void orderingProvidersRequiredPositive() {
    assertTrue(validator.isValid(boba, "1235904154", "503-867-5309", "NY"));
  }

  @Test
  void orderingProvidersRequiredNegative() {
    assertFalse(validator.isValid(null, null, null, "OR"));
    assertFalse(validator.isValid(boba, "", "", "OR"));
    assertFalse(validator.isValid(boba, "", "503-867-5309", "OR"));
    assertFalse(validator.isValid(empty, "123789109", "503-867-5309", "OR"));
  }

  @Test
  void orderingProvidersNotRequiredForBypassedStates() {
    assertTrue(validator.isValid(null, "", "", bypassedStates.get(0)));
    assertTrue(validator.isValid(empty, "", "", bypassedStates.get(1)));
    assertTrue(validator.isValid(null, null, null, bypassedStates.get(0)));
    assertTrue(validator.isValid(boba, null, "503-867-5309", bypassedStates.get(1)));
    assertTrue(validator.isValid(boba, "405981234", "503-867-5309", bypassedStates.get(1)));
  }

  @Test
  void orderingProviderValidatorIgnoresStateCase() {
    assertTrue(validator.isValid(null, "", "", bypassedStates.get(0).toLowerCase()));
  }

  @Test
  void exceptionTest() {
    assertThrows(
        OrderingProviderRequiredException.class,
        () -> validator.assertValidity(null, null, null, "NY"));
  }
}
