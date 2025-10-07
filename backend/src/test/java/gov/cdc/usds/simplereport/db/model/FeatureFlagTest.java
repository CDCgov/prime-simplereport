package gov.cdc.usds.simplereport.db.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import java.util.List;
import org.junit.jupiter.api.Test;

/** ToDo Remove public modifier from this test once Spring for GraphQL migration is done */
public class FeatureFlagTest {
  private FeatureFlag featureFlag = new FeatureFlag();

  @Test
  void equals_isNull_returnsFalse() {
    assertNotEquals(null, featureFlag);
  }

  @Test
  void equals_classNotEqual_returnsFalse() {
    assertNotEquals(List.of(1), featureFlag);
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
