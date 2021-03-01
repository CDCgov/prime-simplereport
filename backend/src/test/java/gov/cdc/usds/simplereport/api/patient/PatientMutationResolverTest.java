package gov.cdc.usds.simplereport.api.patient;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.UploadService;
import graphql.ErrorType;
import graphql.GraphQLError;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import javax.servlet.http.Part;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.ArgumentMatchers.any;
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
            if (t instanceof GraphQLError) {
                var gqe = (GraphQLError) t;
                assertEquals(ErrorType.ExecutionAborted, gqe.getErrorType());
            } else {
                fail();
            }
        }
    }

    @Test
    void validation_exceptions_are_propagated_without_change() throws IOException {
        var personService = mock(PersonService.class);
        var uploadService = mock(UploadService.class);
        when(uploadService.processPersonCSV(any(InputStream.class)))
                .thenThrow(new IllegalGraphqlArgumentException("PANIC"));

        var input = mock(Part.class);
        when(input.getInputStream()).thenReturn(new ByteArrayInputStream(new byte[0]));

        var sut = new PatientMutationResolver(personService, uploadService);

        assertThrows(IllegalGraphqlArgumentException.class, () -> sut.uploadPatients(input));
    }
}
