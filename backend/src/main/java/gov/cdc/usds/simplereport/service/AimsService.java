package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.utils.DateTimeUtils.formatToHL7FileDateString;

import gov.cdc.usds.simplereport.api.model.errors.AimsUploadException;
import gov.cdc.usds.simplereport.db.model.auxiliary.HL7BatchMessage;
import gov.cdc.usds.simplereport.service.model.S3UploadResponse;
import gov.cdc.usds.simplereport.utils.DateGenerator;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.HttpStatusCode;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.ServerSideEncryption;

@Service
@RequiredArgsConstructor
@Slf4j
public class AimsService {

  @Value("${aims.access-key-id}")
  private String aimsAccessKeyId;

  @Value("${aims.secret-access-key}")
  private String aimsSecretAccessKey;

  @Value("${aims.s3-bucket-name}")
  private String aimsS3BucketName;

  @Value("${aims.user-id}")
  private String aimsUserId;

  @Value("${aims.encryption-key}")
  private String aimsEncryptionKey;

  @Value("${aims.sending-environment}")
  private String aimsSendingEnvironment;

  @Value("${aims.receiving-environment}")
  private String aimsReceivingEnvironment;

  private final DateGenerator dateGenerator;

  S3Client createClient() {
    return S3Client.builder()
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(
                AwsBasicCredentials.create(aimsAccessKeyId, aimsSecretAccessKey)))
        .build();
  }

  String generateFilename(UUID submissionId) {
    return String.format(
        "InterPartner~ExpandedELR~Simple-Report~AIMSPlatform~%s~%s~%s~STOP~%s.hl7",
        aimsSendingEnvironment,
        aimsReceivingEnvironment,
        formatToHL7FileDateString(dateGenerator.newDate()),
        submissionId);
  }

  PutObjectResponse putObjectInAimsBucket(String objectKey, String objectBody) {
    try (S3Client s3Client = createClient()) {
      return s3Client.putObject(
          PutObjectRequest.builder()
              .serverSideEncryption(ServerSideEncryption.AWS_KMS)
              .bucket(aimsS3BucketName)
              .ssekmsKeyId(aimsEncryptionKey)
              .key(objectKey)
              .contentType("text/plain")
              .build(),
          RequestBody.fromString(objectBody));
    } catch (S3Exception e) {
      throw new AimsUploadException("Error uploading to AIMS S3 bucket", e);
    }
  }

  public S3UploadResponse sendBatchMessageToAims(UUID submissionId, HL7BatchMessage hl7Batch)
      throws AimsUploadException {
    String filename = generateFilename(submissionId);
    String objectKey = aimsUserId + "/SendTo/" + filename;
    PutObjectResponse putResponse = putObjectInAimsBucket(objectKey, hl7Batch.message());

    int statusCode = putResponse.sdkHttpResponse().statusCode();

    String errorMessage = null;

    if (statusCode != HttpStatusCode.OK) {
      errorMessage =
          putResponse
              .sdkHttpResponse()
              .statusText()
              .orElse(String.format("Status Code %d: Failed to upload %s", statusCode, objectKey));
    }

    return new S3UploadResponse(objectKey, hl7Batch.recordsCount(), errorMessage);
  }
}
