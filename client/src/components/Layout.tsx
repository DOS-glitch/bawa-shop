import { useLanguage } from "@/lib/i18n";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isRTL } = useLanguage();

  return (
    <div className={`min-h-screen ${isRTL ? 'font-arabic' : ''}`}>
      <Header />
      <main>{children}</main>
    </div>
  );
}
