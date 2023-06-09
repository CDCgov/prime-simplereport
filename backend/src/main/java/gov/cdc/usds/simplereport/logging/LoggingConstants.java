package gov.cdc.usds.simplereport.logging;

public final class LoggingConstants {

  private LoggingConstants() {
    /* no instances for you! */
  }

  /** The key to store the request ID for retrieval by loggers (and anybody piggy-backing on it). */
  public static final String REQUEST_ID_MDC_KEY = "graphql-query";

  public static final String ORGANIZATION_ID_MDC_KEY = "org-id";
  public static final String USER_MDC_KEY = "api-user";

  /** The header we will use to return the request ID for debugging purposes. */
  public static final String REQUEST_ID_HEADER = "X-SimpleReport-RequestId";
}
