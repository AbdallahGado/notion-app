import { Heading } from "./_components/heading";
import Heroes from "./_components/heroes";
import Footer from "./_components/footer";

const MarketingPage = () => {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-col items-center justify-center md:justify-start gap-y-8 flex-1 px-6 text-center pb-10">
        <Heading />
        <Heroes />
      </div>
      <Footer />
    </div>
  );
};

export default MarketingPage;
