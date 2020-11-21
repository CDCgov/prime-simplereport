package gov.cdc.usds.simplereport.db.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import gov.cdc.usds.simplereport.test_util.TestDataFactory;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@ActiveProfiles("dev")
@Import(TestDataFactory.class)
public abstract class BaseRepositoryTest {

	@Autowired
	private TestEntityManager _manager;

	protected void flush() {
		_manager.flush();
	}
}
