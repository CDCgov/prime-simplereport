package gov.cdc.usds.simplereport;

import static graphql.schema.idl.TypeRuntimeWiring.newTypeWiring;

import java.io.File;
import java.net.URISyntaxException;
import java.net.URL;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import gov.cdc.usds.simplereport.api.DummyDataRepo;
import graphql.GraphQL;
import graphql.schema.GraphQLSchema;
import graphql.schema.idl.RuntimeWiring;
import graphql.schema.idl.SchemaGenerator;
import graphql.schema.idl.SchemaParser;
import graphql.schema.idl.TypeDefinitionRegistry;
import graphql.schema.idl.errors.SchemaProblem;

@Configuration
public class GraphqlConfiguration {

	@Bean
	public GraphQL buildGraphqlBean(GraphQLSchema schema) {
		return GraphQL.newGraphQL(schema).build();
	}

	@Bean
	public GraphQLSchema buildSchema(RuntimeWiring wiring) throws SchemaProblem, URISyntaxException {
		URL schemalUrl = GraphqlConfiguration.class.getResource("/schema.graphqls");
		TypeDefinitionRegistry registry = new SchemaParser().parse(new File(schemalUrl.toURI()));
		return new SchemaGenerator().makeExecutableSchema(registry, wiring);
	}


	@Bean
    public RuntimeWiring buildWiring() {
		return RuntimeWiring.newRuntimeWiring()
			.type(
					newTypeWiring("Query")
						.dataFetcher("patient", DummyDataRepo.patientFetcher())
						.dataFetcher("device", DummyDataRepo.deviceFetcher())
						.build()
					)
			.build();
	}
}