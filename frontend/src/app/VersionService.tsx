export class VersionService {
  /**
   * fetch the commit SHA deployed with the static assets and compare it to the
   * SHA encoded in the current build
   */
  static async getSHA(): Promise<string> {
    if (process.env.NODE_ENV === "production") {
      return fetch(`${process.env.PUBLIC_URL}/static/commit.txt`).then(
        (res) => {
          if (!res.ok) {
            throw res;
          }
          return res.text();
        }
      );
    }
    return process.env.REACT_APP_CURRENT_COMMIT || "";
  }

  /**
   * reload the window. this method exists to be mocked
   */
  static reload() {
    window.location.reload();
  }
}
