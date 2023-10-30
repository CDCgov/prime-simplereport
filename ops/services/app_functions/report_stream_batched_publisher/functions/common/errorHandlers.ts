export const trackFailures = (
  telemetry,
  { testEventBatch, tagOverrides, publishingQueueName },
) => {
  if (testEventBatch.parseFailureCount > 0) {
    telemetry.trackEvent({
      name: `Queue:${publishingQueueName}. Test Event Parse Failure`,
      properties: {
        count: testEventBatch.parseFailureCount,
        parseFailures: Object.keys(testEventBatch.parseFailure),
      },
      tagOverrides,
    });
  }
};
