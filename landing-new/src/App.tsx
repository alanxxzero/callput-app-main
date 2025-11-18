import { twJoin } from "tailwind-merge";
import NavBar from "./components/layout/NavBar";
import HeroSection from "./components/sections/HeroSection";
import StatsSection from "./components/sections/StatSection";
import DividerSection from "./components/sections/DividerSection";
import LeaderBoardSection from "./components/sections/LeaderBoardSection";
import FeatureSection from "./components/sections/FeatureSection";
import CoreInfraSection from "./components/sections/CoreInfraSection";
import PartnerSection from "./components/sections/PartnerSection";
import FootBar from "./components/layout/FootBar";

function App() {
  return (
    <div className={twJoin("lg:max-w-[1512px] lg:mx-auto lg:px-[12px]")}>
      <NavBar />
      <main className="pt-[60px]">
        <HeroSection />
        <StatsSection />
        <DividerSection videoVersion="v1" />
        <LeaderBoardSection />
        <DividerSection videoVersion="v1" />
        <FeatureSection />
        <CoreInfraSection />
        <DividerSection videoVersion="v2" />
        <PartnerSection />
      </main>
      <FootBar />
    </div>
  );
}

export default App;
