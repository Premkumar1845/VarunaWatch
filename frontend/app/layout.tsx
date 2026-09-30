import './globals.css';
import Link from 'next/link';
import {
  Wifi,
  Wind,
  Grid3x3,
  Satellite,
  Bot,
  Bell,
  LayoutDashboard,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { CoastalLaneProvider } from '@/context/CoastalLaneContext';
import { TopBar } from '@/components/layout/TopBar';

import { BrandLogo } from '@/components/layout/BrandLogo';

export const metadata = {
  title: 'VarunaWatch — Pan-India Coastal Cyclone Intelligence & Resilience Platform',
  description: 'AI-Powered Cyclone Impact & Infrastructure Resilience Platform across All 9 Indian Coastal States & UTs (7,516+ km Coastline)',
};

const NAV = [
  { href: '/dashboard',      label: 'Command Center',    icon: LayoutDashboard },
  { href: '/storm',          label: 'Storm Intelligence', icon: Wind },
  { href: '/infrastructure', label: 'ImpactGrid',         icon: Grid3x3 },
  { href: '/stormtwin',      label: 'Scenarios',          icon: Layers },
  { href: '/ai',             label: 'Varuna AI',          icon: Bot },
  { href: '/satellite',      label: 'VarunaVision',       icon: Satellite },
  { href: '/advisories',     label: 'Sentinel',           icon: Bell },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('vw-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (stored === 'dark' || (!stored && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="flex h-screen overflow-hidden antialiased bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider>
          <CoastalLaneProvider>
            {/* ─── Sidebar ─────────────────────────────────────────────── */}
            <aside className="w-64 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-700 p-4 flex flex-col justify-between shrink-0 z-30 transition-colors duration-200">
              <div>
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 px-2 py-3 mb-6 group">
                  <BrandLogo size={36} />
                  <div>
                    <div className="text-slate-900 dark:text-slate-100 font-bold text-base tracking-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      VarunaWatch
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
                      Pan-India Coastal Defense
                    </div>
                  </div>
                </Link>

                {/* Nav links */}
                <nav className="space-y-0.5">
                  {NAV.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-3 px-3 py-2 rounded-md
                                 text-slate-600 dark:text-slate-300
                                 hover:bg-slate-100 dark:hover:bg-slate-800
                                 hover:text-cyan-700 dark:hover:text-cyan-400
                                 text-sm font-medium transition-colors group"
                    >
                      <Icon
                        size={17}
                        className="text-slate-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors"
                      />
                      <span>{label}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* System Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Coastline Lanes</span>
                  <span className="font-semibold text-cyan-700 dark:text-cyan-400">9 States + UTs</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Model Engine</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Deterministic v2.0</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>AI Advisory</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Gemini 2.0 Flash</span>
                </div>
              </div>
            </aside>

            {/* ─── Main Content ─────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-[#0b1120] transition-colors duration-200">
              {/* Dynamic Top Bar with State Selector */}
              <TopBar />

              {/* Page content */}
              <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0b1120] transition-colors duration-200">
                {children}
              </div>
            </main>

            {/* ─── Fixed theme toggle — bottom-right ───────────────────── */}
            <ThemeToggle />
          </CoastalLaneProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
