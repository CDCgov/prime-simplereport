package gov.cdc.usds.simplereport;

import static graphql.schema.idl.TypeRuntimeWiring.newTypeWiring;

import java.io.File;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.chartset.Charset;
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
		DataFetcher<String> deviceAdder = context -> {
			String newId = context.getArgument("deviceId");
			String displayName = context.getArgument("displayName");
			String deviceManufacturer = context.getArgument("deviceManufacturer");
			String deviceModel = context.getArgument("deviceModel");
			boolean isDefault = context.getArgument("isDefault");
			DummyDataRepo.addDevice(new Device(newId, displayName, deviceManufacturer, deviceModel, isDefault));
			return newId;
		};

		DataFetcher<String> patientAdder = context -> {
			String patientId = context.getArgument("patientId");
			String firstName = context.getArgument("firstName");
			String middleName = context.getArgument("middleName");
			String lastName = context.getArgument("lastName");
			String birthDate = context.getArgument("birthDate");
			String address = context.getArgument("address");
			String phone = context.getArgument("phone");
			LocalDate realDate = LocalDate.parse(birthDate);
			DummyDataRepo.addPatient(new Patient(patientId, firstName, middleName, lastName, realDate, address, phone));
			return patientId;
		};
		return RuntimeWiring.newRuntimeWiring()
			.type(
					newTypeWiring("Query")
						.dataFetcher("patient", DummyDataRepo.patientFetcher())
						.dataFetcher("device", DummyDataRepo.deviceFetcher())
						.build()
			     )
			.type(
					newTypeWiring("Mutation")
						.dataFetcher("addDevice", deviceAdder)
						.dataFetcher("addPatient", patientAdder)
			     )
			.build();
	}
}