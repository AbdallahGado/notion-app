"use client";
import Image from "next/image";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

/**
 * The documents page.
 *
 * This page is shown when the user is at the route /documents.
 *
 * It displays an empty state with a button to create a new document.
 * When the button is clicked, it calls the creation function.
 * If the creation function is not available, an error is shown.
 * If the creation fails, an error is shown.
 * If an unexpected error occurs, an error is shown.
 */
function DocumentsPage() {
  const { user } = useUser();

  const create = useMutation(api.documents.create);
  
  const onCreate = () => {
    if (!create) {
      toast.error("Creation function is not available.");
      return;
    }
    try {
      const promise = create({
        title: "Untitled",
      });

      toast.promise(promise, {
        loading: "Creating a new note...",
        success: "New note created",
        error: "Failed to create a new note",
      });
    } catch (error) {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <Image
        src="/empty.png"
        alt="emptyPng"
        className="dark:hidden"
        width={300}
        height={300}
        style={{ width: "auto", height: "auto" }}
        priority={true}
      />

      <Image
        src="/empty-dark.png"
        alt="empty-dark-Png"
        className="hidden dark:block"
        width={300}
        height={300}
        style={{ width: "auto", height: "auto" }}
        priority={true}
      />
      <h2 className="text-lg font-medium">
        Welcome to {user?.firstName}&apos;s Jotion
      </h2>
      <Button
        variant="outline"
        className="rounded-full hover:opacity-70"
        onClick={onCreate}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Create a note
      </Button>
    </div>
  );
}

export default DocumentsPage;
