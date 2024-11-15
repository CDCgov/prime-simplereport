package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.api.model.CreateSpecimenType;
import gov.cdc.usds.simplereport.api.model.UpdateSpecimenType;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.errors.UnidentifiedSpecimenTypeException;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.TransactionSystemException;

@TestPropertySource(properties = {"spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"})
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
            TransactionSystemException
                .class, // might need to change this once other upgrade issues are resolved per
            // https://github.com/spring-projects/spring-framework/wiki/Spring-Framework-6.1-Release-Notes#data-access-and-transactions
            () -> {
              _service.createSpecimenType(createSpecimenTypeData);
            });
    assert (exception.getMessage()).contains("Could not commit JPA transaction");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void updateNewSpecimenType_success() {
    _service.createSpecimenType(
        CreateSpecimenType.builder()
            .name("Nasal swab")
            .typeCode("012345678")
            .collectionLocationName("Nasopharangyal Structure")
            .collectionLocationCode("123456789")
            .build());

    _service.updateSpecimenType(
        UpdateSpecimenType.builder()
            .build()
            .builder()
            .name("Nasal swab with updates")
            .typeCode("012345678")
            .collectionLocationName("Nasopharangyal Structure with updates")
            .collectionLocationCode("123456788")
            .build());

    assertEquals(1, _service.fetchSpecimenTypes().size());
    assertEquals("Nasal swab with updates", _service.fetchSpecimenTypes().get(0).getName());
    assertEquals(
        "Nasopharangyal Structure with updates",
        _service.fetchSpecimenTypes().get(0).getCollectionLocationName());
    assertEquals("123456788", _service.fetchSpecimenTypes().get(0).getCollectionLocationCode());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void updateNewSpecimenType_throws_UnidentifiedSpecimenTypeError_withBadTypeCode() {
    UpdateSpecimenType updateSpecimen = UpdateSpecimenType.builder().typeCode("012345678").build();
    assertThrows(
        UnidentifiedSpecimenTypeException.class,
        () -> {
          _service.updateSpecimenType(updateSpecimen);
        });
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void
      updateNewSpecimenType_throws_IllegalGraphQlArgumentError_withNonNumericCollectionLocationCode() {
    _service.createSpecimenType(
        CreateSpecimenType.builder()
            .name("Nasal swab")
            .typeCode("012345678")
            .collectionLocationName("Nasopharangyal Structure")
            .collectionLocationCode("123456789")
            .build());

    UpdateSpecimenType updateSpecimen =
        UpdateSpecimenType.builder()
            .typeCode("012345678")
            .collectionLocationCode("some non numeric string")
            .build();
    assertThrows(
        IllegalGraphqlArgumentException.class,
        () -> {
          _service.updateSpecimenType(updateSpecimen);
        });
  }
}
