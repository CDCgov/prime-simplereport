package gov.cdc.usds.simplereport.config;

import org.dataloader.DataLoaderRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoaderRegistryConfiguration {
  @Bean
  public DataLoaderRegistry getDataLoaderRegistry() {
    return new DataLoaderRegistry();
  }
}
