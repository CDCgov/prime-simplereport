export class VersionService {
  /**
   * fetch the commit SHA deployed with the static assets and compare it to the
   * SHA encoded in the current build
   */
  static async getSHA(): Promise<string> {
    if (process.env.NODE_ENV === "production") {
      const result = await fetch(`${process.env.PUBLIC_URL}/static/commit.txt`);
      if (!result.ok) {
        throw result;
      }
      return (await result.text()).trim();
    }
    return process.env.REACT_APP_CURRENT_COMMIT || "";
  }

  /**
   * reload the window. this method exists to be mocked
   */
  static reload() {
    console.info("SHA mismatch. Reloading!");
    window.location.reload();
  }
}
