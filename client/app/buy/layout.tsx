import Footer from "../components/Footer";

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {children}
    <Footer />
    </section>
  );
}
