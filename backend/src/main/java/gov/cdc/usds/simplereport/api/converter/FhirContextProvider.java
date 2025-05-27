package gov.cdc.usds.simplereport.api.converter;

import ca.uhn.fhir.context.FhirContext;

public final class FhirContextProvider {
  private static final FhirContext SHARED = FhirContext.forR4Cached();

  private FhirContextProvider() {}

  public static FhirContext get() {
    return SHARED;
  }
}
