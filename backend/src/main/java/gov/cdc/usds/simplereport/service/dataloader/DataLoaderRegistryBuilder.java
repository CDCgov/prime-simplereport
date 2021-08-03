package gov.cdc.usds.simplereport.service.dataloader;

import gov.cdc.usds.simplereport.api.model.errors.NoDataLoaderFoundException;
import gov.cdc.usds.simplereport.db.model.DatabaseEntity;
import graphql.kickstart.execution.context.GraphQLContext;
import graphql.schema.DataFetchingEnvironment;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import org.dataloader.DataLoader;
import org.dataloader.DataLoaderRegistry;
import org.springframework.stereotype.Component;

/**
 * Aggregates all of te KeyedDataLoaderFactories that are registered with the Dependency Injector
 * into a List, and uses that List to supply DataLoaderRegistries with all of those DataLoaders
 * already registered to them.
 */
@Component
public class DataLoaderRegistryBuilder {
  private final List<KeyedDataLoaderFactory<?, ?>> dataLoaders;

  public DataLoaderRegistryBuilder(List<KeyedDataLoaderFactory<?, ?>> dataLoaders) {
    this.dataLoaders = dataLoaders;
  }

  public DataLoaderRegistry build() {
    DataLoaderRegistry registry = new DataLoaderRegistry();
    dataLoaders.forEach(
        dataLoaderFactory ->
            registry.register(dataLoaderFactory.getKey(), dataLoaderFactory.get()));
    return registry;
  }

  public static <T> CompletableFuture<T> loadFuture(
      DatabaseEntity parentObject, DataFetchingEnvironment dfe, final String key) {
    DataLoaderRegistry registry = ((GraphQLContext) dfe.getContext()).getDataLoaderRegistry();
    DataLoader<UUID, T> loader = registry.getDataLoader(key);
    if (loader == null) {
      throw new NoDataLoaderFoundException(key);
    }
    return loader.load(parentObject.getInternalId());
  }
}
