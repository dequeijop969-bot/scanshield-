import React from "react";
import HeroSection from "@/components/home/HeroSection";
import ScanDemo from "@/components/home/ScanDemo";
import HowItWorks from "@/components/home/HowItWorks";
import ThreatTypes from "@/components/home/ThreatTypes";
import WhyScanShield from "@/components/home/WhyScanShield";
import Shield3DSection from "@/components/home/Shield3DSection";
import FinalCTA from "@/components/home/FinalCTA";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ScanDemo />
      <HowItWorks />
      <ThreatTypes />
      <WhyScanShield />
      <Shield3DSection />
      <FinalCTA />
    </div>
  );
}
