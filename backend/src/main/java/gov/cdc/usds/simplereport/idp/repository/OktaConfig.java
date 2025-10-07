package gov.cdc.usds.simplereport.idp.repository;

import com.okta.sdk.authc.credentials.TokenClientCredentials;
import com.okta.sdk.client.Clients;
import org.openapitools.client.ApiClient;
import org.openapitools.client.api.ApplicationApi;
import org.openapitools.client.api.ApplicationGroupsApi;
import org.openapitools.client.api.GroupApi;
import org.openapitools.client.api.UserApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OktaConfig {

  @Bean
  public ApiClient oktaClient(
      @Value("${okta.client.org-url}") String orgUrl, @Value("${okta.client.token}") String token) {
    return Clients.builder()
        .setOrgUrl(orgUrl)
        .setClientCredentials(new TokenClientCredentials(token))
        .build();
  }

  @Bean
  public GroupApi groupApi(ApiClient apiClient) {
    return new GroupApi(apiClient);
  }

  @Bean
  public UserApi userApi(ApiClient apiClient) {
    return new UserApi(apiClient);
  }

  @Bean
  public ApplicationApi applicationApi(ApiClient apiClient) {
    return new ApplicationApi(apiClient);
  }

  @Bean
  public ApplicationGroupsApi applicationGroupsApi(ApiClient apiClient) {
    return new ApplicationGroupsApi(apiClient);
  }
}
