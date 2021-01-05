package gov.cdc.usds.simplereport.api.queue;

import java.util.List;
import java.util.stream.Collectors;

import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.api.model.ApiTestOrder;
import gov.cdc.usds.simplereport.service.TestOrderService; 


@Component
public class QueueResolver implements GraphQLQueryResolver {

	@Autowired
	private TestOrderService tos;

	public List<ApiTestOrder> getQueue(String facilityId) {
		return tos.getQueue(facilityId).stream()
			.map(o -> new ApiTestOrder(o))
			.collect(Collectors.toList());
	}
}


