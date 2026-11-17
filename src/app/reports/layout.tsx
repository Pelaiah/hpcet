import { Navigation } from '@/components/Navigation';

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-8 overflow-auto">{children}</main>
    </>
  );
}
