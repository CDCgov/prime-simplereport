package gov.cdc.usds.simplereport.db.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.Test;

public class FeatureFlagTest {
  FeatureFlag featureFlag = new FeatureFlag();

  @Test
  void equals_sameObject_returnsTrue() {
    assertTrue(featureFlag.equals(featureFlag));
  }

  @Test
  void equals_isNull_returnsFalse() {
    assertFalse(featureFlag.equals(null));
  }

  @Test
  void equals_classNotEqual_returnsFalse() {
    assertFalse(featureFlag.equals(List.of(1)));
  }

  @Test
  void checks_getter_setter_name() {
    String flagName = "flag1";
    featureFlag.setName(flagName);
    assertEquals(featureFlag.getName(), flagName);
  }

  @Test
  void checks_getter_setter_value() {
    Boolean flagValue = true;
    featureFlag.setValue(flagValue);
    assertEquals(featureFlag.getValue(), flagValue);
  }
}
