package gov.cdc.usds.simplereport.api.converter;

import ca.uhn.hl7v2.DefaultHapiContext;
import ca.uhn.hl7v2.HapiContext;
import lombok.NoArgsConstructor;

@NoArgsConstructor
public final class HapiContextProvider {
  private static final HapiContext SHARED = new DefaultHapiContext();

  public static HapiContext get() {
    return SHARED;
  }
}
