package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.config.DataSourceConfiguration;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.thymeleaf.spring6.SpringTemplateEngine;

/**
 * A base test for Spring Data repository tests. Comes pre-wired with a standard API user to attach
 * to JPA audit events: does not support patient-specific operations.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@Import({
  SliceTestConfiguration.class,
  DbTruncator.class,
  DataSourceConfiguration.class,
  SpringTemplateEngine.class
})
@WithSimpleReportStandardUser
// this allows us to have a non-static @BeforeAll method, at the cost of having slightly less
// isolation between test cases (data could be passed between tests using instance variables). Don't
// pass data between test cases using instance variables!
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles("test")
public abstract class BaseRepositoryTest {

  @Autowired private DbTruncator _truncator;
  @Autowired private TestEntityManager _manager;
  @Autowired protected OrganizationInitializingService _initService;

  /**
   * Use this method to guarantee that a sequence of events will have different
   * millisecond-precision timestamps. Do not use it for any other purpose!
   */
  protected static void pause() {
    try {
      Thread.sleep(2);
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
  }

  @BeforeAll
  void clearDbOnce() {
    _truncator.truncateAll();
  }

  protected void flush() {
    _manager.flush();
  }
}
