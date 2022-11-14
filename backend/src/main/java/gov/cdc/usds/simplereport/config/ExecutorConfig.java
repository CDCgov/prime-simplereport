package gov.cdc.usds.simplereport.config;

import java.util.concurrent.Executor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurerSupport;

@Configuration
public class ExecutorConfig extends AsyncConfigurerSupport {
  @Override
  @Bean
  public Executor getAsyncExecutor() {
    return new ContextAwarePoolExecutor();
  }
}
