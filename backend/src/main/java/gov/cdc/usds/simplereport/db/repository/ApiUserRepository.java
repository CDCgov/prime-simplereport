package gov.cdc.usds.simplereport.db.repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.util.Collection;

import org.springframework.data.repository.Repository;

import gov.cdc.usds.simplereport.db.model.ApiUser;

/** Extremely limited repository for finding and saving (only) {@link ApiUser} entities */
public interface ApiUserRepository extends Repository<ApiUser, UUID> {

	public ApiUser save(ApiUser entity);

	public Optional<ApiUser> findByLoginEmail(String email);

	public List<ApiUser> findAllByLoginEmailIn(Collection<String> emails);
}
