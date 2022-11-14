package gov.cdc.usds.simplereport.config;

import java.util.concurrent.Callable;
import java.util.concurrent.Future;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.util.concurrent.ListenableFuture;
import org.springframework.web.context.request.RequestContextHolder;

public class ContextAwarePoolExecutor extends ThreadPoolTaskExecutor {
  @Override
  public <T> Future<T> submit(Callable<T> task) {
    return super.submit(
        new ContextAwareCallable(task, RequestContextHolder.currentRequestAttributes()));
  }

  @Override
  public <T> ListenableFuture<T> submitListenable(Callable<T> task) {
    return super.submitListenable(
        new ContextAwareCallable(task, RequestContextHolder.currentRequestAttributes()));
  }
}
