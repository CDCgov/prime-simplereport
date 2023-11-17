import { useBlocker } from "react-router-dom";

interface Props {
  message: string;
  when: boolean;
}

const Prompt = ({ message, when }: Props) => {
  const blocker = useBlocker(when);
  const shouldBlock = blocker.state === "blocked" && when;

  if (shouldBlock) {
    const blockConfirmed = window.confirm(message);
    if (blockConfirmed) blocker.proceed();
    else blocker.reset();
  }

  return null;
};

export default Prompt;
