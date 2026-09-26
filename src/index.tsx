import { App } from "./App";
import { createRoot } from "react-dom/client";
import { installGlobalInputHandlers } from "./globalInput";
import { store } from "./store";

installGlobalInputHandlers(store);

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
