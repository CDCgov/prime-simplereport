@GenericGenerators( {
	@GenericGenerator(
		name = "UUID4",
		strategy = "org.hibernate.id.UUIDGenerator"
	),
	@GenericGenerator(
		name = "UUID1",
		strategy = "org.hibernate.id.UUIDGenerator",
		parameters = {
			@Parameter(
				name = "uuid_gen_strategy_class",
				value = "org.hibernate.id.uuid.CustomVersionOneStrategy"
			)
		}
	)

})
package gov.cdc.usds.simplereport.db.model;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.GenericGenerators;
import org.hibernate.annotations.Parameter;
