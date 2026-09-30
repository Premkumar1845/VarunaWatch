import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { CoastalLaneProvider } from '@/context/CoastalLaneContext';
import { TopBar } from '@/components/layout/TopBar';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { SystemInfoDrawer } from '@/components/layout/SystemInfoDrawer';

export const metadata = {
  title: 'VarunaWatch — Pan-India Coastal Cyclone Intelligence & Resilience Platform',
  description: 'AI-Powered Cyclone Impact & Infrastructure Resilience Platform across All 9 Indian Coastal States & UTs (7,516+ km Coastline)',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-icon.png',
  },
};

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
            {/* ─── Slide-over System Specs Drawer ───────────────────── */}
            <SystemInfoDrawer />

            {/* ─── Responsive Sidebar Navigation ───────────────────── */}
            <SidebarNav />

            {/* ─── Main Content Area ─────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-[#0b1120] transition-colors duration-200 relative">
              {/* Dynamic Top Bar with State Selector & Mobile Menu Toggle */}
              <TopBar />

              {/* Page Content Container */}
              <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0b1120] transition-colors duration-200">
                {children}
              </div>
            </main>

            {/* ─── Fixed Theme Toggle ───────────────────────────────── */}
            <ThemeToggle />
          </CoastalLaneProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
