import { Button } from "@/components/ui/button";
import { Logo } from "./logo";

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-100 dark:border-[#23233a] bg-transparent py-8 px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-2">
        <Logo />
        <span className="hidden md:inline-block">
          © {new Date().getFullYear()} Jotion. All rights reserved.
        </span>
      </div>
      <div className="flex gap-4">
        <Button variant="ghost" size="sm" className="hover:opacity-70">
          Privacy Policy
        </Button>
        <Button variant="ghost" size="sm" className="hover:opacity-70">
          Terms & Conditions
        </Button>
      </div>
      <span className="md:hidden block text-center w-full mt-2">
        © {new Date().getFullYear()} Jotion. All rights reserved.
      </span>
    </footer>
  );
};

export default Footer;
