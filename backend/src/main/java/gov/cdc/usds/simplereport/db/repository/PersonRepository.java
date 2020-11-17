package gov.cdc.usds.simplereport.db.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;

/** Interface specification for fetching and manipulating {@link Person} entities */
public interface PersonRepository extends EternalEntityRepository<Person> {

	@Query(BASE_QUERY + " and organization = :org")
	public List<Person> findAllByOrganization(Organization org);
}
