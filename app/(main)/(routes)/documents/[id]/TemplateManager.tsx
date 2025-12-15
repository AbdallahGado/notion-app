"use client";

import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  BookOpen,
  ClipboardList,
  Mail,
  Lightbulb,
  Plus,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: "writing" | "planning" | "communication" | "brainstorm" | "other";
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  content: string;
  tags: string[];
}

interface TemplateManagerProps {
  onSelectTemplate?: (template: DocumentTemplate) => void;
  templates?: DocumentTemplate[];
}

const defaultTemplates: DocumentTemplate[] = [
  {
    id: "blog-post",
    name: "Blog Post",
    description: "Structure for creating engaging blog articles",
    category: "writing",
    icon: FileText,
    tags: ["writing", "blog", "content"],
    content: `# Blog Post Title

## Introduction
Hook your readers with an engaging opening that introduces the topic and why it matters.

## Key Points
### Point 1: First Main Idea
- Supporting detail
- Supporting detail

### Point 2: Second Main Idea
- Supporting detail
- Supporting detail

### Point 3: Third Main Idea
- Supporting detail
- Supporting detail

## Practical Example
Include a concrete example or case study to illustrate your points.

## Conclusion
Summarize key takeaways and include a call-to-action.

---
*Published on: [Date]*  
*Tags: #tag1 #tag2 #tag3*`,
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    description: "Template for organizing meeting discussions and action items",
    category: "planning",
    icon: ClipboardList,
    tags: ["meeting", "notes", "action-items"],
    content: `# Meeting: [Topic]

**Date:** [Date]  
**Time:** [Time]  
**Attendees:** [Names]  
**Location:** [Location or Virtual Link]

## Agenda
- [ ] Topic 1
- [ ] Topic 2
- [ ] Topic 3

## Discussion Summary

### Topic 1: [Name]
- Key point 1
- Key point 2
- Decision: [Outcome]

### Topic 2: [Name]
- Key point 1
- Key point 2
- Decision: [Outcome]

## Action Items
| Item | Owner | Due Date | Status |
|------|-------|----------|--------|
| [Action] | [Name] | [Date] | [ ] |
| [Action] | [Name] | [Date] | [ ] |

## Next Steps
1. [Next step]
2. [Next step]

## Follow-up Date
[Date for next meeting]`,
  },
  {
    id: "email-template",
    name: "Professional Email",
    description: "Template for writing professional emails",
    category: "communication",
    icon: Mail,
    tags: ["email", "professional", "communication"],
    content: `Subject: [Clear, specific subject line]

---

Dear [Recipient Name],

## Opening
Start with a warm greeting and briefly state the purpose of your email.

## Main Content
Provide the key information, context, and any necessary details. Break into paragraphs for clarity.

- Point 1: [Details]
- Point 2: [Details]
- Point 3: [Details]

## Call to Action
What do you want the recipient to do? Be specific and clear about next steps.

## Closing
Thank them for their time and provide a professional sign-off.

Best regards,  
[Your Name]  
[Your Title]  
[Contact Information]`,
  },
  {
    id: "brainstorm",
    name: "Brainstorm Session",
    description: "Capture and organize ideas during brainstorming",
    category: "brainstorm",
    icon: Lightbulb,
    tags: ["brainstorm", "ideas", "creative"],
    content: `# Brainstorm Session: [Topic]

**Date:** [Date]  
**Participants:** [Names]  
**Goal:** [What are we trying to achieve?]

## Raw Ideas
(Capture all ideas without judgment)
- 
- 
- 
- 
- 

## Themes & Patterns
Group similar ideas together and identify themes.

### Theme 1: [Name]
- Idea
- Idea

### Theme 2: [Name]
- Idea
- Idea

## Promising Directions
Which ideas seem most viable or interesting?
1. 
2. 
3. 

## Next Actions
- [ ] Develop idea 1
- [ ] Research similar solutions
- [ ] Get feedback from [person]
- [ ] Prototype or test

## Notes
[Additional thoughts or context]`,
  },
  {
    id: "project-proposal",
    name: "Project Proposal",
    description: "Comprehensive project proposal template",
    category: "planning",
    icon: BookOpen,
    tags: ["project", "proposal", "planning"],
    content: `# Project Proposal: [Project Name]

## Executive Summary
Brief overview of the project, its goals, and expected outcomes.

## Problem Statement
What problem are we solving? Why is it important?

## Proposed Solution
How will we solve this problem? What's our approach?

## Goals & Objectives
- **Goal 1:** [Description]
- **Goal 2:** [Description]
- **Goal 3:** [Description]

## Scope
### In Scope
- [Item]
- [Item]

### Out of Scope
- [Item]
- [Item]

## Timeline
| Phase | Duration | Key Milestones |
|-------|----------|----------------|
| Phase 1 | [Duration] | [Milestone] |
| Phase 2 | [Duration] | [Milestone] |
| Phase 3 | [Duration] | [Milestone] |

## Resources Required
- Budget: $[Amount]
- Team: [Roles needed]
- Tools/Software: [List]

## Success Metrics
How will we measure success?
- Metric 1: [Description]
- Metric 2: [Description]

## Risks & Mitigation
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| [Risk] | High/Med/Low | High/Med/Low | [Plan] |

## Approval
- [ ] Stakeholder 1
- [ ] Stakeholder 2
- [ ] Budget Owner`,
  },
];

const TemplateCard = memo(function TemplateCard({
  template,
  onSelect,
}: {
  template: DocumentTemplate;
  onSelect: () => void;
}) {
  const Icon = template.icon;
  const [showPreview, setShowPreview] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <motion.button
        onClick={onSelect}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:shadow-md transition-all text-left bg-white dark:bg-gray-800"
      >
        <div className="flex items-start gap-3 mb-2">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
            <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {template.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {template.description}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 2).map((tag) => (
            <span
              key={`tag-${tag}`}
              className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 2 && (
            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              +{template.tags.length - 2}
            </span>
          )}
        </div>

        {/* Preview Tooltip */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
            >
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                {template.content.substring(0, 150)}...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
});

TemplateCard.displayName = "TemplateCard";

export const TemplateManager = memo(function TemplateManager({
  onSelectTemplate,
  templates = defaultTemplates,
}: TemplateManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Templates" },
    { id: "writing", label: "Writing" },
    { id: "planning", label: "Planning" },
    { id: "communication", label: "Communication" },
    { id: "brainstorm", label: "Brainstorm" },
  ];

  const filteredTemplates =
    selectedCategory === "all"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const handleSelectTemplate = (template: DocumentTemplate) => {
    onSelectTemplate?.(template);
    setIsOpen(false);
    toast.success(`Using "${template.name}" template`);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm font-medium">Templates</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/20"
            />

            {/* Modal Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Document Templates
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Choose a template to jumpstart your document
                  </p>
                </div>
              </div>

              {/* Category Filter */}
              <div className="px-6 pt-4 flex gap-2 overflow-x-auto">
                {categories.map((cat) => (
                  <motion.button
                    key={`category-${cat.id}-${cat.label}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {cat.label}
                  </motion.button>
                ))}
              </div>

              {/* Templates Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <motion.div
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <AnimatePresence mode="wait">
                    {filteredTemplates.map((template, index) => (
                      <TemplateCard
                        key={`template-${index}-${template.id}-${template.name}`}
                        template={template}
                        onSelect={() => handleSelectTemplate(template)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

TemplateManager.displayName = "TemplateManager";
