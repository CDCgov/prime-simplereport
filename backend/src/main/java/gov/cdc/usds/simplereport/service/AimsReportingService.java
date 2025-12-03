package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.utils.DateTimeUtils.formatToHL7FileDateString;

import gov.cdc.usds.simplereport.api.model.errors.AimsUploadException;
import gov.cdc.usds.simplereport.config.AimsProperties;
import gov.cdc.usds.simplereport.service.model.S3UploadResponse;
import gov.cdc.usds.simplereport.utils.DateGenerator;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.HttpStatusCode;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.ServerSideEncryption;

@Service
@RequiredArgsConstructor
@Slf4j
public class AimsReportingService {
  private final AimsProperties aimsProperties;

  private final DateGenerator dateGenerator;

  private final S3Client s3Client;

  String generateFilename(UUID submissionId) {
    return String.format(
        "InterPartner~ExpandedELR~Simple-Report~AIMSPlatform~%s~%s~%s~STOP~%s.hl7",
        aimsProperties.getSendingEnvironment(),
        aimsProperties.getReceivingEnvironment(),
        formatToHL7FileDateString(dateGenerator.newDate()),
        submissionId);
  }

  private PutObjectResponse putObjectInAimsBucket(UUID submissionId, String objectBody) {
    String filename = generateFilename(submissionId);
    String objectKey = aimsProperties.getUserId() + "/SendTo/" + filename;

    Map<String, String> metadata = aimsProperties.getS3Metadata();
    metadata.put("AIMSPlatformFilename", filename);
    metadata.put("AIMSPlatformSenderMessageId", submissionId.toString());

    try {
      return s3Client.putObject(
          PutObjectRequest.builder()
              .serverSideEncryption(ServerSideEncryption.AWS_KMS)
              .bucket(aimsProperties.getBucketName())
              .ssekmsKeyId(aimsProperties.getEncryptionKey())
              .metadata(metadata)
              .key(objectKey)
              .contentType("text/plain")
              .build(),
          RequestBody.fromString(objectBody));
    } catch (S3Exception e) {
      throw new AimsUploadException("Error uploading to AIMS S3 bucket", e);
    }
  }

  public S3UploadResponse sendBatchMessageToAims(
      UUID submissionId, String batchMessage, int recordsCount) throws AimsUploadException {
    PutObjectResponse putResponse = putObjectInAimsBucket(submissionId, batchMessage);
    int statusCode = putResponse.sdkHttpResponse().statusCode();

    String errorMessage = null;

    if (statusCode != HttpStatusCode.OK) {
      errorMessage =
          putResponse
              .sdkHttpResponse()
              .statusText()
              .orElse(
                  String.format(
                      "Status Code %d: Failed to upload submission %s", statusCode, submissionId));
    }

    return new S3UploadResponse(submissionId, recordsCount, errorMessage);
  }
}
