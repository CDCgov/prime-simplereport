package gov.cdc.usds.simplereport.service.dataloader;

import org.dataloader.BatchLoader;
import org.dataloader.DataLoader;

/**
 * In order for the GraphQL DataResolvers to be able to access DataLoaders from the
 * DataLoaderRegistry, each DataLoader must have a unique key. In order for our DataLoaders to
 * <em>self-register</em> with the DataLoaderRegistry, they must also know their own key at
 * instantiation.
 */
public abstract class KeyedDataLoaderFactory<K, V> {
  private final BatchLoader<K, V> batchLoadFunction;

  KeyedDataLoaderFactory(BatchLoader<K, V> batchLoadFunction) {
    this.batchLoadFunction = batchLoadFunction;
  }

  public DataLoader<K, V> get() {
    return new DataLoader<>(batchLoadFunction);
  }

  public abstract String getKey();
}
