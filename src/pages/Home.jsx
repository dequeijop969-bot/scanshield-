import React from "react";
import HeroSection from "@/components/home/HeroSection";
import TrustedBar from "@/components/home/TrustedBar";
import HowItWorks from "@/components/home/HowItWorks";
import ThreatTypes from "@/components/home/ThreatTypes";
import TikTokShopSection from "@/components/home/TikTokShopSection";
import WhyScanShield from "@/components/home/WhyScanShield";
import Shield3DSection from "@/components/home/Shield3DSection";
import Testimonials from "@/components/home/Testimonials";
import FAQSection from "@/components/home/FAQSection";
import FinalCTA from "@/components/home/FinalCTA";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <TrustedBar />
      <HowItWorks />
      <ThreatTypes />
      <TikTokShopSection />
      <WhyScanShield />
      <Shield3DSection />
      <Testimonials />
      <FAQSection />
      <FinalCTA />
    </div>
  );
}
