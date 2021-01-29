package gov.cdc.usds.simplereport.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.graphql.spring.boot.test.GraphQLResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.io.InputStream;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Created by nickrobison on 11/21/20
 */
@AutoConfigureMockMvc
class CSVUploadTest extends BaseApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testPersonUpload() throws Exception {
        useOrgAdmin();
        try (InputStream inputStream = CSVUploadTest.class.getClassLoader().getResourceAsStream("test-upload.csv")) {
            assertNotNull(inputStream);
            byte[] targetArray = new byte[inputStream.available()];
            final int read = inputStream.read(targetArray);
            assertTrue(read > 0, "Should have read bytes");
            mockMvc.perform(post("/upload/person").content(targetArray).contentType("text/csv"))
                    .andExpect(status().isAccepted())
                    .andReturn();
        }

        final GraphQLResponse postMultipart = _template.postForResource("person-query");
        assertTrue(postMultipart.isOk());
        final JsonNode jsonResponse = postMultipart.readTree();
        assertTrue(jsonResponse.get("data").get("patients").has(0));
    }
}
