package gov.cdc.usds.simplereport.db.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.EntityGraph.EntityGraphType;
import org.springframework.data.repository.CrudRepository;

import gov.cdc.usds.simplereport.db.model.ApiUser;

public interface ApiUserRepository extends CrudRepository<ApiUser, UUID> {

	@EntityGraph(
		type =  EntityGraphType.LOAD,
		attributePaths = {
			"person.organization.orderingProvider",
			"person.organization.defaultDeviceType",
			"person.organization.configuredDevices",
		}
	)
	public Optional<ApiUser> findByLoginEmail(String email);
}
