import { createRoot } from "react-dom/client";

import { ReactApp } from "./App";

const rootElement = document.getElementById("root");
createRoot(rootElement as Element).render(<ReactApp />);
