package gov.cdc.usds.simplereport.logging;

public abstract class LoggingMessages {
  public static final String AUDIT_UPDATED_USER_MSG = "User with id={} updated by user with id={}";
  public static final String AUDIT_CREATED_USER_MSG = "User with id={} created by user with id={}";
  public static final String AUDIT_REPROVISIONED_USER_MSG =
      "User with id={} re-provisioned by user with id={}";
  public static final String AUDIT_EVENT_MSG = "Saving audit event for {}";
  public static final String AUDIT_WEBHOOK_EVENT_MSG = "Saving webhook REST audit event for {}";
}
