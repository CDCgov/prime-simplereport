package gov.cdc.usds.simplereport.service.idVerification;

public class DemoExperianService implements ExperianService {

  public String fetchToken() {
    return "accessToken";
  }

  public void reset() {
    // clear any state variables
  }
}
