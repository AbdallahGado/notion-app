import { Navbar } from "./_components/navbar";

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full dark:bg-[#1F1F1F]">
      <main className="h-full pt-40 ">
        <Navbar />
        {children}
      </main>
    </div>
  );
};
export default MarketingLayout;
