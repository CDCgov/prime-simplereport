package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;

/** Interface specification for fetching and manipulating {@link ApiUser} entities */
public interface ApiUserRepository extends EternalSystemManagedEntityRepository<ApiUser> {

  public static final String NAME_ORDER =
      " order by last_name, first_name, middle_name, internal_id";

  // Defining this method explicitly means that findById() will not be able to find soft-deleted
  // users,
  // rendering un-deletion near-impossible
  @Query(BASE_QUERY + " and internalId = :id")
  public Optional<ApiUser> findById(UUID id);

  @Query("FROM #{#entityName} e WHERE internalId = :id")
  public Optional<ApiUser> findByIdIncludeArchived(UUID id);

  @Query(BASE_QUERY + " and loginEmail = :email")
  public Optional<ApiUser> findByLoginEmail(String email);

  // This query is run on user-supplied input so needs to be normalized
  @Query("FROM #{#entityName} e WHERE lower(loginEmail) = lower(:email)")
  public Optional<ApiUser> findByLoginEmailIncludeArchived(String email);

  @Query(BASE_QUERY + " and loginEmail IN :emails" + NAME_ORDER)
  public List<ApiUser> findAllByLoginEmailInOrderByName(Collection<String> emails);
}
