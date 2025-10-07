package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.api.model.CreateSpecimenType;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.TransactionSystemException;

@TestPropertySource(
    properties = {
      "hibernate.query.interceptor.error-level=ERROR",
      "spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"
    })
class SpecimenTypeServiceTest extends BaseServiceTest<SpecimenTypeService> {

  @Autowired private SpecimenTypeRepository specimenTypeRepository;

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void createNewSpecimenType_success() {
    _service.createSpecimenType(
        CreateSpecimenType.builder()
            .name("Nasal swab")
            .typeCode("012345678")
            .collectionLocationName("Nasopharangyal Structure")
            .collectionLocationCode("123456789")
            .build());

    assertEquals(1, _service.fetchSpecimenTypes().size());
    assertEquals("Nasal swab", _service.fetchSpecimenTypes().get(0).getName());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportOrgAdminUser
  void createNewSpecimenType_failsWithInvalidCredentials() {
    CreateSpecimenType createSpecimenTypeData =
        CreateSpecimenType.builder()
            .name("Nasal swab")
            .typeCode("012345678")
            .collectionLocationName("Nasopharangyal Structure")
            .collectionLocationCode("123456789")
            .build();

    assertThrows(
        AccessDeniedException.class,
        () -> {
          _service.createSpecimenType(createSpecimenTypeData);
        });
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void createNewSpecimenType_failsWithTooShortLoinc() {
    CreateSpecimenType createSpecimenTypeData =
        CreateSpecimenType.builder()
            .name("Nasal swab")
            .typeCode("012")
            .collectionLocationName("Nasopharangyal Structure")
            .collectionLocationCode("123")
            .build();
    Exception exception =
        assertThrows(
            TransactionSystemException.class,
            () -> {
              _service.createSpecimenType(createSpecimenTypeData);
            });
    assert (exception.getMessage()).contains("Could not commit JPA transaction");
  }
}
