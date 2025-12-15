"use client";

import React from "react";
import { toast } from "sonner";
import { Button } from "./button";
import { RefreshCw } from "lucide-react";

interface ErrorToastProps {
  message: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onRetry?: () => void;
}

export const showErrorToast = ({
  message,
  description,
  action,
  onRetry,
}: ErrorToastProps) => {
  toast.error(message, {
    description: description && (
      <div className="flex flex-col gap-2">
        <p className="text-sm">{description}</p>
        <div className="flex gap-2">
          {onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onRetry();
                toast.dismiss();
              }}
              className="h-6 px-2 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          )}
          {action && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                action.onClick();
                toast.dismiss();
              }}
              className="h-6 px-2 text-xs"
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    ),
    action: !description && (onRetry || action) ? {
      label: onRetry ? "Retry" : action?.label || "Action",
      onClick: () => {
        if (onRetry) {
          onRetry();
        } else if (action) {
          action.onClick();
        }
        toast.dismiss();
      },
    } : undefined,
    duration: 8000, // Longer duration for error toasts
  });
};

export const showNetworkErrorToast = (onRetry?: () => void) => {
  showErrorToast({
    message: "Connection Error",
    description: "Unable to connect to the server. Please check your internet connection and try again.",
    onRetry,
  });
};

export const showAuthErrorToast = () => {
  showErrorToast({
    message: "Authentication Required",
    description: "Please sign in to continue.",
    action: {
      label: "Sign In",
      onClick: () => {
        // Redirect to sign in page
        window.location.href = "/sign-in";
      },
    },
  });
};

export const showPermissionErrorToast = () => {
  showErrorToast({
    message: "Permission Denied",
    description: "You don't have permission to perform this action.",
  });
};

export const showFileUploadErrorToast = (fileName: string, onRetry?: () => void) => {
  showErrorToast({
    message: "Upload Failed",
    description: `Failed to upload "${fileName}". Please try again.`,
    onRetry,
  });
};

export const showSaveErrorToast = (onRetry?: () => void) => {
  showErrorToast({
    message: "Save Failed",
    description: "Your changes couldn't be saved. Please try again.",
    onRetry,
  });
};
