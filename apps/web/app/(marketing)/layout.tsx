import { Bricolage_Grotesque, DM_Sans } from 'next/font/google'
import { LandingNav } from '@/components/marketing/LandingNav'

const bricolage = Bricolage_Grotesque({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  variable: '--font-body-lp',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500'],
})

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${bricolage.variable} ${dmSans.variable} lp-root min-h-screen`}>
      <LandingNav />
      <main>{children}</main>
    </div>
  )
}
