package gov.cdc.usds.simplereport;

import static graphql.schema.idl.TypeRuntimeWiring.newTypeWiring;

import java.io.File;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.charset.Charset;
import java.time.LocalDate;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import gov.cdc.usds.simplereport.api.DummyDataRepo;
import gov.cdc.usds.simplereport.api.model.Device;
import gov.cdc.usds.simplereport.api.model.Patient;
import graphql.GraphQL;
import graphql.schema.DataFetcher;
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
		InputStream stream = getClass().getClassLoader().getResourceAsStream("schema.graphqls");
		TypeDefinitionRegistry registry = new SchemaParser().parse(
			new InputStreamReader(stream, Charset.defaultCharset())
		);
		return new SchemaGenerator().makeExecutableSchema(registry, wiring);
	}

	@Bean
	public RuntimeWiring buildWiring() {
		DummyDataRepo repo = new DummyDataRepo();
		DataFetcher<String> addDevice = context -> {
			return repo.addDevice(
				context.getArgument("displayName"),
				context.getArgument("deviceManufacturer"),
				context.getArgument("deviceModel"),
				context.getArgument("isDefault")
			);
		};

		DataFetcher<String> updateOrganization = context -> {
			return repo.updateOrganization(
				context.getArgument("testingFacilityName"),
				context.getArgument("cliaNumber"),
				context.getArgument("orderingProviderName"),
				context.getArgument("orderingProviderNPI"),
				context.getArgument("orderingProviderStreet"),
				context.getArgument("orderingProviderStreetTwo"),
				context.getArgument("orderingProviderCity"),
				context.getArgument("orderingProviderCounty"),
				context.getArgument("orderingProviderState"),
				context.getArgument("orderingProviderZipCode"),
				context.getArgument("orderingProviderPhone")
			);
		};
		return RuntimeWiring.newRuntimeWiring()
			.type(
				newTypeWiring("Query")
					.dataFetcher("patient", repo.patientFetcher())
					.dataFetcher("user", repo.userFetcher())
					.build()
			)
			.type(
				newTypeWiring("Mutation")
					.dataFetcher("addDevice", addDevice)
					.dataFetcher("updateOrganization", updateOrganization)
			)
			.build();
	}
}