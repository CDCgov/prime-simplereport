import moment from "moment";

import getNodeEnv from "./utils/getNodeEnv";
import reload from "./utils/reload";

export const LOCAL_STORAGE_KEY = "mostRecentVersionReload";
export class VersionService {
  public static async enforce() {
    if (!VersionService.localStorageIsAvailable()) {
      return;
    }

    const mostRecentReload = VersionService.getMostRecentReload();
    if (mostRecentReload != null) {
      if (moment().isBefore(moment(mostRecentReload).add(15, "minutes"))) {
        // We have reloaded too recently; get outta here
        return;
      }
    }

    const remoteSHA = await VersionService.getSHA();

    if (import.meta.env.VITE_CURRENT_COMMIT !== remoteSHA) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(new Date()));
      reload();
    }
  }

  static getMostRecentReload(): Date | null {
    const serializedLastKnown = localStorage.getItem(LOCAL_STORAGE_KEY);
    return serializedLastKnown === null
      ? null
      : JSON.parse(serializedLastKnown);
  }

  /**
   * fetch the commit SHA deployed with the static assets and compare it to the
   * SHA encoded in the current build
   */
  public static async getSHA(): Promise<string> {
    if (getNodeEnv() === "production") {
      const result = await fetch(
        `${import.meta.env.VITE_PUBLIC_URL}/assets/commit.txt`
      );
      if (!result.ok) {
        throw result;
      }
      return (await result.text()).trim();
    }
    return import.meta.env.VITE_CURRENT_COMMIT || "";
  }

  /**
   * from: https://stackoverflow.com/a/16427747/15155214
   */
  static localStorageIsAvailable() {
    const key = "localStorageTestKey";
    try {
      localStorage.setItem(key, key);
      localStorage.removeItem(key);
      return true;
    } catch (e: any) {
      return false;
    }
  }
}
