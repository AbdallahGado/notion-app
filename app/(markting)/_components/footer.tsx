import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-100 dark:border-[#23233a] bg-transparent py-8 px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-4">
        <Logo />
        <span className="hidden md:inline-block">
          © {new Date().getFullYear()} Jotion. All rights reserved.
        </span>
        <div className="h-3 w-[1px] bg-slate-200 dark:bg-white/10 hidden md:block" />
        <div className="hidden md:flex items-center gap-1.5 font-medium text-[10px] tracking-[0.2em] uppercase opacity-50 hover:opacity-100 transition-opacity text-slate-500">
            <span className="w-1 h-1 rounded-full bg-indigo-500" />
            Built by AG
        </div>
      </div>
      <div className="flex gap-4">
        <Link href="/privacy">
           <Button variant="ghost" size="sm" className="hover:opacity-70">
              Privacy Policy
            </Button>
        </Link>
        <Link href="/terms">
            <Button variant="ghost" size="sm" className="hover:opacity-70">
              Terms & Conditions
            </Button>
        </Link>
      </div>
      <div className="md:hidden flex flex-col items-center gap-2 w-full mt-2">
        <span className="text-center">
            © {new Date().getFullYear()} Jotion. All rights reserved.
        </span>
        <div className="flex items-center gap-1.5 font-medium text-[10px] tracking-[0.2em] uppercase opacity-50 hover:opacity-100 transition-opacity text-slate-500">
            <span className="w-1 h-1 rounded-full bg-indigo-500" />
            Built by AG
        </div>
      </div>
    </footer>
  );
};

export default Footer;
