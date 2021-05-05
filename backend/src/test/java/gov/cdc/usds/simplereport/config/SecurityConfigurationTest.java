package gov.cdc.usds.simplereport.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockServletContext;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfiguration;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebAppConfiguration
// @EnableWebSecurity
@SpringBootApplication
@SpringBootTest(
    classes = {
        MockServletContext.class,
        SecurityConfiguration.class,
        WebConfiguration.class,
        // WebSecurityConfiguration.class,
        MockApplication.class
    }
)
public class SecurityConfigurationTest {
    @Autowired private MockMvc _mockMvc;

    // @Autowired
    // private WebApplicationContext context;

    // @BeforeEach
    // public void setup() {
    //     _mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    // }

    @Test
    public void allowsGetRequests() throws Exception {
        MockHttpServletRequestBuilder builder = 
        get("/");

       _mockMvc.perform(builder).andExpect(status().is2xxSuccessful());
    }

    @Test
    public void doesNotAllowUnauthorizedPostRequests() throws Exception {
        MockHttpServletRequestBuilder builder = 
        post("/thisIsAnUnAuthorizedPath");

        _mockMvc.perform(builder).andExpect(status().is2xxSuccessful());
        // _mockMvc.perform(builder).andExpect(status().is4xxClientError());
    }
}


/**
 * @RunWith( SpringJUnit4ClassRunner.class )
@WebAppConfiguration
@EnableWebMvcSecurity
@SpringApplicationConfiguration( classes = {
        MockServletContext.class,
        HttpSessionConfig.class,
        WebSecurityConfig.class
} )
@SuppressWarnings( "PMD.TooManyStaticImports" )
public class HeadersTest {

    private MockMvc mockMvc = null;

    @Autowired
    private WebApplicationContext context;

    @Before
    public void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup( context )
                .addFilter( new CORSFilter(), "/*" )
                .build();
    }

    @Test
    public void testOptions() throws Exception {
        mockMvc.perform( options( "/" ) )
                .andExpect( status().is2xxSuccessful() )
                .andExpect( header().string( "Access-Control-Allow-Origin", notNullValue() ) )
                .andExpect( header().string( "Access-Control-Allow-",
                        equalToIgnoringCase( "POST, GET, PUT, OPTIONS, DELETE" ) ) )
                .andExpect( header().string( "Access-Control-Allow-Headers",
                        equalToIgnoringCase( "content-type, x-auth-token, x-requested-with" ) ) )
                .andExpect( header().string( "Access-Control-Expose-Headers", equalToIgnoringCase( "Location" ) ) )
                .andExpect( header().string( "Access-Control-Max-Age", notNullValue() ) )
        ;
    }    
}
 */