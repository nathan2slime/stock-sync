import { createRoot } from "react-dom/client";

import "~/configure-zod";
import { App } from "~/app";

import "~/style.css";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
