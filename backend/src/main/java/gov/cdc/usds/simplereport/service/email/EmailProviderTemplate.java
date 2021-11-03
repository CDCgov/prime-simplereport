package gov.cdc.usds.simplereport.service.email;

public enum EmailProviderTemplate {
  /* Add values here to match each template name used in the spring configuration profile map
   * `simple-report.sendgrid.dynamic-templates`.
   */

  // new account request next-steps email (to account requester)
  ACCOUNT_REQUEST,

  // identity verification failed email (to account requester)
  ID_VERIFICATION_FAILED,

  // message to account requester who didn't complete automatic id verification
  ORGANIZATION_ID_VERIFICATION_REMINDER,

  // test results template
  SIMPLE_REPORT_TEST_RESULT;
}
