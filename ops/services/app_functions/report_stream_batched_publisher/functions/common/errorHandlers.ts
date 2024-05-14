export const trackFailures = (
  telemetry,
  { testEventBatch, publishingQueueName },
) => {
  if (testEventBatch.parseFailureCount > 0) {
    telemetry.trackEvent({
      name: `Queue:${publishingQueueName}. Test Event Parse Failure`,
      properties: {
        count: testEventBatch.parseFailureCount,
        parseFailures: Object.keys(testEventBatch.parseFailure),
      },
    });
  }
};
