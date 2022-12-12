import { createRoot } from "react-dom/client";

import { ReactApp } from "./App";

export const rootElement = document.getElementById("root");
createRoot(rootElement as Element).render(<ReactApp />);
