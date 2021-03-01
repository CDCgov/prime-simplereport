package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;

/**
 * A base test for Spring Data repository tests. Comes pre-wired with a standard API user to attach
 * to JPA audit events: does not support patient-specific operations.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@Import(SliceTestConfiguration.class)
@WithSimpleReportStandardUser
public abstract class BaseRepositoryTest {

  protected static void pause() {
    try {
      Thread.sleep(2);
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
  }

  @Autowired private TestEntityManager _manager;

  @Autowired protected OrganizationInitializingService _initService;

  protected void flush() {
    _manager.flush();
  }
}
