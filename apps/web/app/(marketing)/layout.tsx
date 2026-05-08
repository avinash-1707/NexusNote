import { LandingNav } from '@/components/marketing/LandingNav'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp-root min-h-screen">
      <LandingNav />
      <main>{children}</main>
    </div>
  )
}
