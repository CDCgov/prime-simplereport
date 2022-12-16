package gov.cdc.usds.simplereport.config;

import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.provider.jdbctemplate.JdbcTemplateLockProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class ShedlockConfiguration {

    @Value("${spring.jpa.properties.hibernate.default_schema}")
    private String schemaName;

    @Bean
    public LockProvider lockProvider(DataSource dataSource) {
        return new JdbcTemplateLockProvider(
                JdbcTemplateLockProvider.Configuration.builder()
                        .withJdbcTemplate(new JdbcTemplate(dataSource))
                        .withTableName(schemaName + ".shedlock")
                        .usingDbTime() // lock provider will use UTC time based on the DB server clock instead of app server clocks
                        .build()
        );
    }
}
