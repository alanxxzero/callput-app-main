import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { StatsProvider } from "./contexts/data/StatsProvider.tsx";
import { DeviceProvider } from "./contexts/device/DeviceProvider.tsx";
import { LeaderBoardProvider } from "./contexts/data/LeaderBoardProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StatsProvider>
      <LeaderBoardProvider>
        <DeviceProvider>
          <App />
        </DeviceProvider>
      </LeaderBoardProvider>
    </StatsProvider>
  </StrictMode>
);
