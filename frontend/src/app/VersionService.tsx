import moment from 'moment';

import reload from "./utils/reload";

const LOCAL_STORAGE_KEY = 'mostRecentVersionReload';
export class VersionService {
  public static async enforce() {
    const mostRecentReload = VersionService.getMostRecentReload();
    if (mostRecentReload != null) {
      if(moment().isBefore(moment(mostRecentReload).add(15, 'minutes'))) { 
        // We have reloaded too recently; get outta here
        return;
      }
    }

    const remoteSHA = await VersionService.getSHA();

    if (process.env.REACT_APP_CURRENT_COMMIT !== remoteSHA) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(new Date()));
      reload();
    }
  }

  static getMostRecentReload(): Date | null {
    const serializedLastKnown = localStorage.getItem(LOCAL_STORAGE_KEY);
    return serializedLastKnown === null ? null : JSON.parse(serializedLastKnown);
  }

  /**
   * fetch the commit SHA deployed with the static assets and compare it to the
   * SHA encoded in the current build
   */
  public static async getSHA(): Promise<string> {
    if (process.env.NODE_ENV === "production") {
      const result = await fetch(`${process.env.PUBLIC_URL}/static/commit.txt`);
      if (!result.ok) {
        throw result;
      }
      return (await result.text()).trim();
    }
    return process.env.REACT_APP_CURRENT_COMMIT || "";
  }
}
