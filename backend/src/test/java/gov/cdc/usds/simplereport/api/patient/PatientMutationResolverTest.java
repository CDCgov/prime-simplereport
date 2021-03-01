package gov.cdc.usds.simplereport.api.patient;

import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.UploadService;
import graphql.GraphQLError;
import java.io.IOException;
import javax.servlet.http.Part;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PatientMutationResolverTest {
    @Test
    @SuppressWarnings("checkstyle:IllegalCatch")
    void io_exceptions_are_surfaced_as_graphql_errors() throws IOException {
        var personService = mock(PersonService.class);
        var uploadService = mock(UploadService.class);
        var input = mock(Part.class);
        when(input.getInputStream()).thenThrow(new IOException("Some TCP error, probably."));

        var sut = new PatientMutationResolver(personService, uploadService);

        try {
            sut.uploadPatients(input);
            throw new IllegalStateException("Shouldn't reach this line!");
        } catch (Throwable t) {
            assertTrue(t instanceof GraphQLError);
        }
    }
}
