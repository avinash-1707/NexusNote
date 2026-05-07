import { HeroSection } from '@/components/marketing/HeroSection'
import { FeaturesSection } from '@/components/marketing/FeaturesSection'
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection'
import { FooterCTASection } from '@/components/marketing/FooterCTASection'
import { LandingFooter } from '@/components/marketing/LandingFooter'

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FooterCTASection />
      <LandingFooter />
    </>
  )
}
