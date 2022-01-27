package gov.cdc.usds.simplereport.config;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.encoder.PatternLayoutEncoder;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.ConsoleAppender;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.AuditService;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
@Slf4j
public class AuditingConfig {
  @Autowired private ApiUserService _userService;

  @Bean
  public AuditorAware<ApiUser> getCurrentApiUserProvider() {
    return () -> {
      log.debug("Fetching current user for audit");
      Optional<ApiUser> user = Optional.of(_userService.getCurrentApiUserInContainedTransaction());
      return user;
    };
  }

  @Bean
  public Logger jsonLogger(@Value("${logging.pattern.json-log}") String jsonPattern) {
    LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
    PatternLayoutEncoder patternLayoutEncoder = new PatternLayoutEncoder();

    patternLayoutEncoder.setPattern(jsonPattern);
    patternLayoutEncoder.setContext(loggerContext);
    patternLayoutEncoder.start();

    ConsoleAppender<ILoggingEvent> consoleAppender = new ConsoleAppender<>();
    consoleAppender.setEncoder(patternLayoutEncoder);
    consoleAppender.setContext(loggerContext);
    consoleAppender.start();

    Logger logger = (Logger) LoggerFactory.getLogger(AuditService.class);
    logger.addAppender(consoleAppender);
    logger.setAdditive(false);
    return logger;
  }
}
