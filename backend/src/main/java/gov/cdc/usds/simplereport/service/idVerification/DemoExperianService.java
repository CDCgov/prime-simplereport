package gov.cdc.usds.simplereport.service.idVerification;

import static gov.cdc.usds.simplereport.service.idVerification.ExperianTranslator.createInitialRequestBody;

import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationRequest;

public class DemoExperianService implements ExperianService {

  public String fetchToken() {
    return "accessToken";
  }

  public void getQuestions(IdentityVerificationRequest userData) {
    // todo(emmastephenson): implement
    System.out.println("in the demo environment");
    String initialRequestBody =
        createInitialRequestBody(
            "fakeUsername", "fakePassword", userData, "fakeTenantId", "fakeClientReferenceId");
    System.out.println("request body for Experian: " + initialRequestBody);
  }

  public void reset() {
    // clear any state variables
  }
}
