"use client";
import Image from "next/image";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { create } from "../../../../convex/documents";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

function DocumentsPage() {
  const { user } = useUser();

  const create = useMutation(api.documents.create);

  const onCreate = () => {
    const promise = create({
      title: "Untitled",
    });

    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "new note created",
      error: "failed to create a new note",
    });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <Image
        src="/empty.png"
        alt="emptyPng"
        className="dark:hidden"
        width={300}
        height={300}
        style={{ width: "auto", height: "auto" }} // Maintain aspect ratio
        priority={true} // Optimize for LCP
      />

      {/* Dark theme image */}
      <Image
        src="/empty-dark.png"
        alt="empty-dark-Png"
        className="hidden dark:block"
        width={300}
        height={300}
        style={{ width: "auto", height: "auto" }} // Maintain aspect ratio
        priority={true} // Optimize for LCP
      />
      <h2 className="text-lg font-medium">
        Welcome to {user?.firstName}&apos;s Jotion
      </h2>
      <Button variant="outline" className="rounded-full hover:bg-[#000500]" onClick={onCreate}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Create a note
      </Button>
    </div>
  );
}

export default DocumentsPage;
