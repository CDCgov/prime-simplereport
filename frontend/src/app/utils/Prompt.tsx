// Reimplementation of <Prompt /> and usePrompt() from react-router-dom since they were removed for v6.
// Remove this once react-router readds these at some point.
// Credit to @code-jongleur on GitHub: https://github.com/remix-run/react-router/issues/8139#issuecomment-1014746446

import { useContext, useEffect, useCallback } from "react";
import { UNSAFE_NavigationContext as NavigationContext } from "react-router-dom";
import type { History, Transition } from "history";

declare type Navigator = Pick<
  History,
  "go" | "push" | "replace" | "createHref" | "block"
>;

/**
 * Blocks all navigation attempts. This is useful for preventing the page from
 * changing until some condition is met, like saving form data.
 *
 * @param  blocker
 * @param  when
 * @see https://reactrouter.com/api/useBlocker
 */
export function useBlocker(blocker: any, when = true) {
  const { navigator } = useContext(NavigationContext);

  useEffect(() => {
    if (!when) {
      return;
    }

    const unblock = (navigator as Navigator).block((tx: any) => {
      const autoUnblockingTx = {
        ...tx,
        retry() {
          unblock();
          tx.retry();
        },
      };

      blocker(autoUnblockingTx);
    });

    return unblock;
  }, [navigator, blocker, when]);
}
/**
 * Prompts the user with an Alert before they leave the current screen.
 *
 * @param  message
 * @param  when
 */
export function usePrompt(message: string, when = true) {
  const blocker = useCallback(
    (tx: Transition) => {
      // eslint-disable-next-line no-alert
      if (window.confirm(message)) {
        tx.retry();
      }
    },
    [message]
  );

  useBlocker(blocker, when);
}

interface Props {
  message: string;
  when: boolean;
}

const Prompt = ({ message, when }: Props) => {
  usePrompt(message, when);

  return null;
};

export default Prompt;
