import React from "react";
import { twJoin } from "tailwind-merge";

import VideoBgDivider from "../../assets/videos/bg-divider.mp4";
import VideoBgDivider2 from "../../assets/videos/bg-divider-2.mp4";

type VideoVersion = "v1" | "v2";

interface DividerSectionProps {
  videoVersion: VideoVersion;
}

const DividerSection: React.FC<DividerSectionProps> = ({ videoVersion }) => {
  const height = videoVersion === "v1" ? "h-[60px] lg:h-[126px]" : "h-[135px] lg:h-[284px]";
  const videoSrc = videoVersion === "v1" ? VideoBgDivider : VideoBgDivider2;

  return (
    <section className={twJoin("relative w-full overflow-hidden", height)}>
      <div className="absolute w-full h-full">
        <video className="object-cover w-full h-full" autoPlay loop muted playsInline>
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>
    </section>
  );
};

export default DividerSection;
