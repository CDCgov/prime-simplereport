package gov.cdc.usds.simplereport.service.idVerification;

public interface ExperianService {

  /** Fetches an access token from Experian. */
  public String fetchToken() throws IllegalArgumentException;
}
