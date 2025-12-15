import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Users, Target, X } from "lucide-react";

interface TemplatesModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSelectTemplate: (template: string) => void;
}

const templates = [
  {
    id: "blank",
    title: "Blank",
    description: "Start with a blank document",
    icon: <FileText className="w-8 h-8" />,
    content: "",
  },
  {
    id: "meeting-notes",
    title: "Meeting Notes",
    description: "Structured notes for meetings",
    icon: <Users className="w-8 h-8" />,
    content: `# Meeting Notes

## Attendees
-

## Agenda
-

## Discussion
-

## Action Items
- `,
  },
  {
    id: "project-plan",
    title: "Project Plan",
    description: "Plan your project with milestones",
    icon: <Target className="w-8 h-8" />,
    content: `# Project Plan

## Overview
-

## Objectives
-

## Timeline
-

## Resources
-

## Risks
- `,
  },
];

const TemplatesModal = ({
  open,
  onClose,
  onSelectTemplate,
}: TemplatesModalProps) => {
  if (!open) return null;

  const handleSelect = (templateId: string) => {
    onSelectTemplate(templateId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#23233a] rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Choose a Template</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              className="h-auto p-6 flex flex-col items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleSelect(template.id)}
            >
              {template.icon}
              <div className="text-center">
                <div className="font-semibold">{template.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {template.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatesModal;
export { templates };
