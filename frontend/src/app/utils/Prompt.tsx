import { useBlocker } from "react-router-dom";
import { useEffect } from "react";

interface Props {
  message: string;
  when: boolean;
}

const Prompt = ({ message, when }: Props) => {
  const blocker = useBlocker(when);
  const shouldBlock = blocker.state === "blocked" && when;

  useEffect(() => {
    if (shouldBlock) {
      const userHitOkOnLeaveAlert = window.confirm(message);
      if (userHitOkOnLeaveAlert) blocker.proceed();
      else blocker.reset();
    }
  }, [shouldBlock, message, blocker]);

  return null;
};

export default Prompt;
