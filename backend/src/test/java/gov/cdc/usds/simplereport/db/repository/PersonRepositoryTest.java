package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Person.SpecField;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.PersonService;
import java.time.LocalDate;
import java.util.List;
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
    Organization org = _orgRepo.save(new Organization("Here", "there"));
    Organization other = _orgRepo.save(new Organization("There", "where?"));

    StreetAddress addy =
        new StreetAddress("123 4th Street", null, "Washington", "DC", "20001", null);
    _repo.save(
        new Person(
            org,
            "lookupid",
            "Joe",
            null,
            "Schmoe",
            null,
            LocalDate.now(),
            addy,
            "(123) 456-7890",
            PersonRole.VISITOR,
            "",
            null,
            "",
            "",
            false,
            false));

    List<Person> found =
        _repo.findAll(
            inWholeOrganizationFilter(org),
            PageRequest.of(
                PersonService.DEFAULT_PAGINATION_PAGEOFFSET,
                PersonService.DEFAULT_PAGINATION_PAGESIZE));
    assertEquals(1, found.size());
    assertEquals("Joe", found.get(0).getFirstName());
    found =
        _repo.findAll(
            inWholeOrganizationFilter(other),
            PageRequest.of(
                PersonService.DEFAULT_PAGINATION_PAGEOFFSET,
                PersonService.DEFAULT_PAGINATION_PAGESIZE));
    assertEquals(0, found.size());
  }
}
