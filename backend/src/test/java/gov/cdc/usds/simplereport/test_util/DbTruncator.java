package gov.cdc.usds.simplereport.test_util;

import javax.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Shamelessly stolen from a past life: a function executor that truncates all the business tables
 * in our schema, all at once so no foreign keys get upset.
 */
@Component
@Slf4j
public class DbTruncator {

  @Value("${spring.jpa.properties.hibernate.default_schema:public}")
  private String hibernateSchema;

  /**
   * Credit:
   * https://stackoverflow.com/questions/2829158/truncating-all-tables-in-a-postgres-database
   */
  private static final String TRUNCATE_FUNCTION_TEMPLATE =
      "DO "
          + "$func$ "
          + "BEGIN "
          + "   EXECUTE "
          + "   (SELECT 'TRUNCATE TABLE ' || string_agg(oid::regclass::text, ', ') || ' CASCADE' "
          + "    FROM   pg_class "
          + "    WHERE  relkind = 'r' "
          + // only tables
          "    AND relname not like 'databasechangelog%%' "
          + // keep supported_disease table (populated via a liquibase migration)
          "     AND relname not like 'supported_disease' "
          + // no liquibase tables!
          "    AND    relnamespace = '%1$s'::regnamespace "
          + "   ); "
          + "END "
          + "$func$;";

  @Autowired private JdbcTemplate jdbc;

  /* (non-Javadoc)
   *
   * @see gov.usds.case_issues.test_util.DbTruncator#truncateAll() */
  @Transactional
  public void truncateAll() {
    log.info("Truncating all non-liquibase tables in {}", hibernateSchema);
    jdbc.execute(String.format(TRUNCATE_FUNCTION_TEMPLATE, hibernateSchema));
  }
}
