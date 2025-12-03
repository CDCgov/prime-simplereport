package gov.cdc.usds.simplereport.config;

import java.util.Map;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Component
@ConfigurationProperties(prefix = "aims")
@Getter
@Setter
@RequiredArgsConstructor
@Slf4j
public class AimsProperties {
  private String accessKeyId;
  private String secretAccessKey;
  private String encryptionKey;
  private String bucketName;
  private String userId;
  private String messageQueueEndpoint;
  private String sendingEnvironment;
  private String receivingEnvironment;
  private Map<String, String> s3Metadata;

  @Bean
  public S3Client getS3Client() {
    return S3Client.builder()
        .region(Region.US_EAST_1)
        .credentialsProvider(
            StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
        .build();
  }
}
