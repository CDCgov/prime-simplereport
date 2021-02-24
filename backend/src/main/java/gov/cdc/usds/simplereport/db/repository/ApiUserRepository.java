package gov.cdc.usds.simplereport.db.repository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.Collection;

import org.springframework.data.jpa.repository.Query;

import gov.cdc.usds.simplereport.db.model.ApiUser;

/**
 * Interface specification for fetching and manipulating {@link ApiUser} entities
 */
public interface ApiUserRepository extends EternalSystemManagedEntityRepository<ApiUser> {

	// Defining this method explicitly means that findById() will not be able to find soft-deleted users,
	// rendering un-deletion near-impossible
	@Query(BASE_QUERY + " and internalId = :id")
	public Optional<ApiUser> findById(UUID id);

	@Query(BASE_QUERY + " and loginEmail = :email")
	public Optional<ApiUser> findByLoginEmail(String email);

	@Query(BASE_QUERY + " and loginEmail IN :emails")
	public Set<ApiUser> findAllByLoginEmailIn(Collection<String> emails);
}
