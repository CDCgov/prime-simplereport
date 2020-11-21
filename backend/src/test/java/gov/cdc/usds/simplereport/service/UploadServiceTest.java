package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.ProviderRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.io.IOException;
import java.io.InputStream;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Created by nickrobison on 11/21/20
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("dev")
class UploadServiceTest {

    private final PersonService _ps;
    private final UploadService _service;

    public UploadServiceTest(@Autowired OrganizationRepository orgRepo, @Autowired ProviderRepository providerRepo, @Autowired PersonRepository repo) {
        OrganizationService os= new OrganizationService(orgRepo, providerRepo);
        this._ps = new PersonService(os, repo);
        this._service = new UploadService(_ps);
    }

    @Test
    void testInsert() throws IOException {
        // Read the test CSV file
        try (InputStream inputStream = UploadServiceTest.class.getClassLoader().getResourceAsStream("test-upload.csv")) {
            this._service.processPersonCSV(inputStream);
        }

        assertEquals(1, this._ps.getPatients().size());
    }
}
