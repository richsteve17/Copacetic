import HeroSection from '@/components/home/HeroSection';
import ThesisSection from '@/components/home/ThesisSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import SystemsSection from '@/components/home/SystemsSection';
import DimensionsSection from '@/components/home/DimensionsSection';
import TierLadderSection from '@/components/home/TierLadderSection';
import SpecimenWallSection from '@/components/home/SpecimenWallSection';
import OutputPreviewSection from '@/components/home/OutputPreviewSection';
import FinalCtaSection from '@/components/home/FinalCtaSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ThesisSection />
      <HowItWorksSection />
      <SystemsSection />
      <DimensionsSection />
      <TierLadderSection />
      <SpecimenWallSection />
      <OutputPreviewSection />
      <FinalCtaSection />
    </>
  );
}
