import Footer from "../components/Footer";
import Header from "../components/Header";

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <Header />
      {children}
      {/* <Footer /> */}
    </section>
  );
}
