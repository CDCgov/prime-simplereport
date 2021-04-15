public class NoDataLoaderFoundException extends IllegalStateException {
  public static final long serialVersionUID = 1L;

  public NoDataLoaderFoundException(String type) {
    super("No DataLoader found: " + type);
  }
}
