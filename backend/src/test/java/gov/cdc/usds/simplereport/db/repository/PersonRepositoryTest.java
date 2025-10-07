package gov.cdc.usds.simplereport.db.repository;

import static gov.cdc.usds.simplereport.test_util.TestDataBuilder.getAddress;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Person.SpecField;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.service.PersonService;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

class PersonRepositoryTest extends BaseRepositoryTest {

  @Autowired private PersonRepository _repo;
  @Autowired private OrganizationRepository _orgRepo;

  private Specification<Person> inWholeOrganizationFilter(Organization org) {
    return (root, query, cb) ->
        cb.equal(root.get(SpecField.ORGANIZATION).get(SpecField.INTERNAL_ID), org.getInternalId());
  }

  @Test
  void doPersonOperations() {
    Organization org = _orgRepo.save(new Organization("Here", "k12", "there", true));
    Organization other = _orgRepo.save(new Organization("There", "other", "where?", true));

    _repo.save(
        new Person(
            org,
            "lookupid",
            "Joe",
            null,
            "Schmoe",
            null,
            LocalDate.now(),
            getAddress(),
            "USA",
            PersonRole.VISITOR,
            List.of("joe@shmoe.com"),
            null,
            "",
            null,
            "",
            false,
            false,
            "English",
            TestResultDeliveryPreference.NONE));

    List<Person> found =
        _repo.findAll(
            inWholeOrganizationFilter(org),
            PageRequest.of(
                PersonService.DEFAULT_PAGINATION_PAGEOFFSET,
                PersonService.DEFAULT_PAGINATION_PAGESIZE));
    assertEquals(1, found.size());
    assertEquals("Joe", found.get(0).getFirstName());
    Person createdPerson = found.get(0);
    UUID personId = createdPerson.getInternalId();

    Optional<Person> personFoundById = _repo.findByIdAndOrganization(personId, org, false);
    assertTrue(personFoundById.isPresent());
    assertEquals("Joe", personFoundById.get().getFirstName());

    createdPerson.setIsDeleted(true);
    Optional<Person> deletedPerson = _repo.findByIdAndOrganization(personId, org, true);
    assertTrue(deletedPerson.isPresent());
    assertTrue(deletedPerson.get().isDeleted());

    found =
        _repo.findAll(
            inWholeOrganizationFilter(other),
            PageRequest.of(
                PersonService.DEFAULT_PAGINATION_PAGEOFFSET,
                PersonService.DEFAULT_PAGINATION_PAGESIZE));
    assertEquals(0, found.size());
  }
}
