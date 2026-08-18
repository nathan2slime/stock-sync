import { Index } from "~/pages/index";
import { AppProvider } from "~/providers/app-provider";

export const App = () => (
  <AppProvider>
    <Index />
  </AppProvider>
);
