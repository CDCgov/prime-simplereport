package gov.cdc.usds.simplereport.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.context.ActiveProfiles;

import com.graphql.spring.boot.test.GraphQLTestTemplate;

import gov.cdc.usds.simplereport.test_util.DbTruncator;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev")
public abstract class BaseApiTest {

	@Autowired
	private DbTruncator _truncator;

	@Autowired
	protected GraphQLTestTemplate _template; // screw delegation

	protected void truncateDb() {
		_truncator.truncateAll();
	}
}
