package gov.cdc.usds.simplereport.config;

import java.util.concurrent.Callable;
import lombok.RequiredArgsConstructor;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

@RequiredArgsConstructor
public class ContextAwareCallable<T> implements Callable<T> {
  private Callable<T> task;
  private RequestAttributes context;

  public ContextAwareCallable(Callable<T> task, RequestAttributes context) {
    this.task = task;
    this.context = context;
  }

  @Override
  public T call() throws Exception {
    if (context != null) {
      RequestContextHolder.setRequestAttributes(context);
      //      CurrentOrganizationRolesContextHolder organizationRolesContextHolder = new
      // CurrentOrganizationRolesContextHolder();
      //      CurrentOrganizationRolesContextHolder
    }

    try {
      return task.call();
    } finally {
      RequestContextHolder.resetRequestAttributes();
    }
  }
}
