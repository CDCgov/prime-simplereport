import { setupWorker } from "msw/browser";
import { handlers } from "frontend/src/stories/storyMocks";

export const worker = setupWorker(...handlers);
