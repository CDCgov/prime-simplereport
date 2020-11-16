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
import gov.cdc.usds.simplereport.api.model.TestResult;
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
		repo.init_relations();

		DataFetcher<String> addPatient = context -> {
			return repo.addPatient(
				context.getArgument("patientId"),
				context.getArgument("firstName"),
				context.getArgument("middleName"),
				context.getArgument("lastName"),
				context.getArgument("birthDate"),
				context.getArgument("street"),
				context.getArgument("streetTwo"),
				context.getArgument("city"),
				context.getArgument("state"),
				context.getArgument("zipCode"),
				context.getArgument("phone")
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
				context.getArgument("orderingProviderPhone"),
				context.getArgument("devices")
			);
		};

		DataFetcher<String> addTestResult = context -> {
			return repo.addTestResult(
				context.getArgument("deviceId"),
				context.getArgument("result"),
				context.getArgument("patientId")
			);
		};
		return RuntimeWiring.newRuntimeWiring()
			.type(
				newTypeWiring("Query")
					.dataFetcher("device", repo.deviceFetcher())
					.dataFetcher("patient", repo.patientFetcher())
					.dataFetcher("user", repo.userFetcher())
					.dataFetcher("testResult", repo.testResultFetcher())
					.build()
			)
			.type(
				newTypeWiring("Mutation")
					.dataFetcher("updateOrganization", updateOrganization)
					.dataFetcher("addPatient", addPatient)
					.dataFetcher("addTestResult", addTestResult)
			)
			.build();
	}
}