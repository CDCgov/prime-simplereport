package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.databind.RuntimeJsonMappingException;

import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.StreetAddress;
import gov.cdc.usds.simplereport.db.repository.BaseRepositoryTest;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.ProviderRepository;

/**
 * Created by nickrobison on 11/21/20
 */
class UploadServiceTest extends BaseRepositoryTest {

    private final PersonService _ps;
    private final UploadService _service;

    public UploadServiceTest(@Autowired OrganizationRepository orgRepo, @Autowired ProviderRepository providerRepo, @Autowired PersonRepository repo) {
        OrganizationService os = new OrganizationService(orgRepo, providerRepo);
        this._ps = new PersonService(os, repo);
        this._service = new UploadService(_ps);
    }

    @Test
    void testInsert() throws IOException {
        // Read the test CSV file
        try (InputStream inputStream = UploadServiceTest.class.getClassLoader().getResourceAsStream("test-upload.csv")) {
            this._service.processPersonCSV(inputStream);
        }

        final StreetAddress address = new StreetAddress("123 Main Street", "", "Washington", "DC", "20008", "");
        final List<Person> patients = this._ps.getPatients();
        assertAll(() -> assertEquals(1, patients.size()),
                () -> assertEquals("Doe", patients.get(0).getFirstName()),
                () -> assertEquals(address, patients.get(0).getAddress(), "Should have the correct address"));
    }

    @Test
    void testNotCSV() throws IOException {
        try (ByteArrayInputStream bis = new ByteArrayInputStream("this is not a CSV".getBytes(StandardCharsets.UTF_8))) {
            final IllegalArgumentException e = assertThrows(IllegalArgumentException.class, () -> this._service.processPersonCSV(bis), "Should fail to parse");
            assertTrue(e.getMessage().contains("Empty or invalid CSV submitted"), "Should have correct error message");
            assertEquals(0, this._ps.getPatients().size(), "Should not have any patients");
        }
    }

    @Test
    void testMalformedCSV() throws IOException {
        try (ByteArrayInputStream bis = new ByteArrayInputStream("patientID\n'123445'\n".getBytes(StandardCharsets.UTF_8))) {
            final RuntimeJsonMappingException e = assertThrows(RuntimeJsonMappingException.class, () -> this._service.processPersonCSV(bis), "CSV parsing should fail");
            assertTrue(e.getMessage().contains("Not enough column values: expected 21, found 1"), "Should have correct error message");
        }
    }
}
