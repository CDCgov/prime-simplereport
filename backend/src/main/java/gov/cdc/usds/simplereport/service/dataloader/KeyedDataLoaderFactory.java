package gov.cdc.usds.simplereport.service.dataloader;

import gov.cdc.usds.simplereport.api.model.errors.NoDataLoaderFoundException;
import graphql.kickstart.execution.context.GraphQLContext;
import graphql.schema.DataFetchingEnvironment;
import java.util.concurrent.CompletableFuture;
import org.dataloader.BatchLoader;
import org.dataloader.DataLoader;
import org.dataloader.DataLoaderRegistry;

/**
 * The DataLoaderRegistryBuilder will receive an injected List of KeyedDataLoaderFactories, and each
 * time it builds a new DataLoaderRegistry it will use the factories to new up a DataLoader of each
 * type that needs to be registered. In order for them to be get and set, they also have to be aware
 * of their key.
 */
abstract class KeyedDataLoaderFactory<K, V> {
  private final BatchLoader<K, V> batchLoadFunction;

  KeyedDataLoaderFactory(BatchLoader<K, V> batchLoadFunction) {
    this.batchLoadFunction = batchLoadFunction;
  }

  public CompletableFuture<V> load(K searchObject, DataFetchingEnvironment dfe) {
    DataLoaderRegistry registry = ((GraphQLContext) dfe.getContext()).getDataLoaderRegistry();
    DataLoader<K, V> loader = registry.getDataLoader(getKey());
    if (loader == null) {
      throw new NoDataLoaderFoundException(getKey());
    }
    return loader.load(searchObject);
  }

  public DataLoader<K, V> get() {
    return new DataLoader<>(batchLoadFunction);
  }

  public abstract String getKey();
}
