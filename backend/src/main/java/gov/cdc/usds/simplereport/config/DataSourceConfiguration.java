package gov.cdc.usds.simplereport.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import liquibase.integration.spring.SpringLiquibase;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class DataSourceConfiguration {

  // The reasoning for this file is a little confusing: Liquibase doesn't support
  // multiple databases as part of the same migration. But we need to configure
  // the no-PHI user for the `metabase` database. That means we need two data sources,
  // each running a Liquibase migration - one for SR and one for Metabase.

  // SimpleReport data source

  @Bean
  @Primary
  @ConfigurationProperties(prefix = "spring.datasource.simplereport")
  public DataSource primaryDataSource(
      HikariConfig dataSourceProperties, LiquibaseProperties dataSourceLiquibaseProperties) {

    if (dataSourceLiquibaseProperties.getUser() != null) {
      dataSourceProperties.setUsername(dataSourceLiquibaseProperties.getUser());
    }
    if (dataSourceLiquibaseProperties.getPassword() != null) {
      dataSourceProperties.setPassword(dataSourceLiquibaseProperties.getPassword());
    }

    return new HikariDataSource(dataSourceProperties);
  }

  @Bean
  @Primary
  @ConfigurationProperties(prefix = "spring.datasource.simplereport.hikari")
  public HikariConfig primaryDataSourceProperties() {
    return new HikariConfig();
  }

  @Bean
  @Primary
  @ConfigurationProperties(prefix = "spring.liquibase.simplereport")
  public LiquibaseProperties primaryLiquibaseProperties() {
    return new LiquibaseProperties();
  }

  @Bean
  @Primary
  public SpringLiquibase primaryLiquibase() {
    return springLiquibase(
        primaryDataSource(primaryDataSourceProperties(), primaryLiquibaseProperties()),
        primaryLiquibaseProperties());
  }

  // Metabase data source

  @Bean
  @ConfigurationProperties(prefix = "spring.datasource.metabase")
  public DataSource metabaseDataSource(
      HikariConfig dataSourceProperties, LiquibaseProperties dataSourceLiquibaseProperties) {

    if (dataSourceLiquibaseProperties.getUser() != null) {
      dataSourceProperties.setUsername(dataSourceLiquibaseProperties.getUser());
    }
    if (dataSourceLiquibaseProperties.getPassword() != null) {
      dataSourceProperties.setPassword(dataSourceLiquibaseProperties.getPassword());
    }

    return new HikariDataSource(dataSourceProperties);
  }

  @Bean
  @ConfigurationProperties(prefix = "spring.datasource.metabase.hikari")
  public HikariConfig metabaseDataSourceProperties() {
    return new HikariConfig();
  }

  @Bean
  @ConfigurationProperties(prefix = "spring.liquibase.metabase")
  public LiquibaseProperties metabaseLiquibaseProperties() {
    return new LiquibaseProperties();
  }

  @Bean
  public SpringLiquibase metabaseLiquibase() {
    return springLiquibase(
        metabaseDataSource(metabaseDataSourceProperties(), metabaseLiquibaseProperties()),
        metabaseLiquibaseProperties());
  }

  private static SpringLiquibase springLiquibase(
      DataSource dataSource, LiquibaseProperties properties) {
    SpringLiquibase liquibase = new SpringLiquibase();
    liquibase.setChangeLog(properties.getChangeLog());
    liquibase.setChangeLogParameters(properties.getParameters());
    var contexts = properties.getContexts();
    liquibase.setContexts(contexts != null ? String.join(",", contexts) : null);
    liquibase.setDataSource(dataSource);
    liquibase.setDefaultSchema(properties.getDefaultSchema());
    liquibase.setDropFirst(properties.isDropFirst());
    var labelFilter = properties.getLabelFilter();
    liquibase.setLabelFilter(labelFilter != null ? String.join(",", labelFilter) : null);
    liquibase.setRollbackFile(properties.getRollbackFile());
    liquibase.setShouldRun(properties.isEnabled());
    liquibase.setDatabaseChangeLogTable(properties.getDatabaseChangeLogTable());
    liquibase.setDatabaseChangeLogLockTable(properties.getDatabaseChangeLogLockTable());
    return liquibase;
  }
}
