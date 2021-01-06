package gov.cdc.usds.simplereport.db.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;

import gov.cdc.usds.simplereport.db.model.Organization;

/** Interface specification for fetching and manipulating {@link Organization} entities */
public interface OrganizationRepository extends EternalEntityRepository<Organization> {

	@Query(EternalEntityRepository.BASE_QUERY + " and e.externalId = :externalId")
	public Optional<Organization> findByExternalId(String externalId);

    @Query(EternalEntityRepository.BASE_QUERY + " and e.externalId in (:externalIds)")
    public List<Organization> findAllByExternalId(Collection<String> externalIds);

}
