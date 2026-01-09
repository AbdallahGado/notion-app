import React from "react";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Users, 
  Target, 
  X, 
  Lightbulb,
  Bug,
  FileCode,
  TrendingUp,
  Calendar,
  CheckCircle2,
  MessageSquare,
  BookOpen,
  Zap
} from "lucide-react";

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
    category: "Basic"
  },
  {
    id: "meeting-notes",
    title: "Meeting Notes",
    description: "Structured notes for meetings",
    icon: <Users className="w-8 h-8 text-blue-500" />,
    category: "Team",
    content: `<h1>Meeting Notes</h1>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<p><strong>Time:</strong> </p>
<p><strong>Location:</strong> </p>
<h2>Attendees</h2>
<ul><li></li><li></li><li></li></ul>
<h2>Agenda</h2>
<ol><li></li><li></li><li></li></ol>
<h2>Discussion Points</h2>
<h3>Topic 1</h3>
<p></p>
<h3>Topic 2</h3>
<p></p>
<h2>Decisions Made</h2>
<ul><li></li></ul>
<h2>Action Items</h2>
<ul data-type="taskList">
  <li data-checked="false"><label><input type="checkbox"><span></span></label><div></div></li>
  <li data-checked="false"><label><input type="checkbox"><span></span></label><div></div></li>
  <li data-checked="false"><label><input type="checkbox"><span></span></label><div></div></li>
</ul>
<h2>Next Steps</h2>
<p></p>`,
  },
  {
    id: "project-plan",
    title: "Project Plan",
    description: "Comprehensive project planning",
    icon: <Target className="w-8 h-8 text-green-500" />,
    category: "Planning",
    content: `<h1>Project Plan</h1>
<h2>Project Overview</h2>
<p><strong>Project Name:</strong> </p>
<p><strong>Start Date:</strong> </p>
<p><strong>Target Completion:</strong> </p>
<p><strong>Project Lead:</strong> </p>
<h2>Objectives</h2>
<ol><li></li><li></li><li></li></ol>
<h2>Key Deliverables</h2>
<ul data-type="taskList">
  <li data-checked="false"><label><input type="checkbox"><span></span></label><div></div></li>
  <li data-checked="false"><label><input type="checkbox"><span></span></label><div></div></li>
</ul>
<h2>Timeline & Milestones</h2>
<table>
  <tr><td>Phase</td><td>Description</td><td>Due Date</td><td>Status</td></tr>
  <tr><td>Phase 1</td><td></td><td></td><td>🟡 Planning</td></tr>
  <tr><td>Phase 2</td><td></td><td></td><td>⚪ Not Started</td></tr>
  <tr><td>Phase 3</td><td></td><td></td><td>⚪ Not Started</td></tr>
</table>
<h2>Resources Required</h2>
<ul><li><strong>Team Members:</strong> </li><li><strong>Budget:</strong> </li><li><strong>Tools:</strong> </li></ul>
<h2>Risks & Mitigation</h2>
<table>
  <tr><td>Risk</td><td>Impact</td><td>Mitigation Strategy</td></tr>
  <tr><td></td><td>High/Medium/Low</td><td></td></tr>
</table>
<h2>Success Criteria</h2>
<ul><li></li></ul>`,
  },
  {
    id: "prd",
    title: "Product Requirements",
    description: "Product requirements document",
    icon: <FileCode className="w-8 h-8 text-purple-500" />,
    category: "Product",
    content: `<h1>Product Requirements Document (PRD)</h1>
<h2>Overview</h2>
<p><strong>Product Name:</strong> </p>
<p><strong>Version:</strong> 1.0</p>
<p><strong>Author:</strong> </p>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<h2>Problem Statement</h2>
<p></p>
<h2>Goals & Objectives</h2>
<ol><li></li><li></li><li></li></ol>
<h2>User Stories</h2>
<ul><li>As a [user type], I want to [action] so that [benefit]</li><li></li></ul>
<h2>Features & Requirements</h2>
<h3>Must Have (P0)</h3>
<ul data-type="taskList">
  <li data-checked="false"><label><input type="checkbox"><span></span></label><div></div></li>
</ul>
<h3>Should Have (P1)</h3>
<ul data-type="taskList">
  <li data-checked="false"><label><input type="checkbox"><span></span></label><div></div></li>
</ul>
<h2>Success Metrics</h2>
<table>
  <tr><td>Metric</td><td>Target</td><td>Measurement</td></tr>
  <tr><td></td><td></td><td></td></tr>
</table>
<h2>Launch Timeline</h2>
<ul><li><strong>Development:</strong> </li><li><strong>Testing:</strong> </li><li><strong>Release:</strong> </li></ul>`,
  },
  {
    id: "sprint-planning",
    title: "Sprint Planning",
    description: "Agile sprint planning template",
    icon: <Zap className="w-8 h-8 text-yellow-500" />,
    category: "Agile",
    content: `<h1>Sprint Planning</h1>
<p><strong>Sprint Number:</strong> </p>
<p><strong>Duration:</strong> 2 weeks</p>
<h2>Sprint Goal</h2>
<p></p>
<h2>Team Capacity</h2>
<table>
  <tr><td>Team Member</td><td>Capacity (hours)</td><td>Assigned (hours)</td></tr>
  <tr><td></td><td></td><td></td></tr>
</table>
<h2>User Stories Selected</h2>
<h3>High Priority</h3>
<ul data-type="taskList">
  <li data-checked="false"><label><input type="checkbox"><span></span></label><div><strong>[STORY-001]</strong> - </div></li>
</ul>
<h2>Definition of Done</h2>
<ul data-type="taskList">
  <li data-checked="false"><label><input type="checkbox"><span></span></label><div>Code reviewed</div></li>
  <li data-checked="false"><label><input type="checkbox"><span></span></label><div>Tests passing</div></li>
</ul>`,
  },
  {
    id: "weekly-report",
    title: "Weekly Report",
    description: "Weekly progress report",
    icon: <Calendar className="w-8 h-8 text-indigo-500" />,
    category: "Reporting",
    content: `<h1>Weekly Report</h1>
<p><strong>Week of:</strong> ${new Date().toLocaleDateString()}</p>
<h2>Highlights</h2>
<p>✨ </p>
<h2>Accomplishments</h2>
<ul><li>✅ </li><li>✅ </li></ul>
<h2>In Progress</h2>
<ul><li>🔄 </li></ul>
<h2>Blockers & Challenges</h2>
<ul><li>⚠️ </li></ul>
<h2>Plans for Next Week</h2>
<ol><li></li></ol>
<h2>Metrics & KPIs</h2>
<table>
  <tr><td>Metric</td><td>This Week</td><td>Last Week</td><td>Trend</td></tr>
  <tr><td></td><td></td><td></td><td></td></tr>
</table>`,
  },
  {
    id: "decision-log",
    title: "Decision Log",
    description: "Document important decisions",
    icon: <CheckCircle2 className="w-8 h-8 text-teal-500" />,
    category: "Documentation",
    content: `<h1>Decision Log</h1>
<h2>Decision: [Title]</h2>
<p><strong>Status:</strong> ✅ Approved / 🟡 Pending</p>
<h2>Context</h2>
<p></p>
<h2>Options Considered</h2>
<h3>Option 1: [Name]</h3>
<p><strong>Pros:</strong></p><ul><li></li></ul>
<p><strong>Cons:</strong></p><ul><li></li></ul>
<h2>Decision</h2>
<p><strong>Chosen Option:</strong> </p>
<p><strong>Rationale:</strong></p>
<h2>Action Items</h2>
<ul data-type="taskList">
  <li data-checked="false"><label><input type="checkbox"><span></span></label><div></div></li>
</ul>`,
  },
  {
    id: "technical-design",
    title: "Technical Design",
    description: "System design document",
    icon: <FileCode className="w-8 h-8 text-orange-500" />,
    category: "Engineering",
    content: `<h1>Technical Design Document</h1>
<p><strong>Author:</strong> </p>
<p><strong>Status:</strong> 🟡 Draft</p>
<h2>Overview</h2>
<p></p>
<h2>Architecture</h2>
<pre><code>[Add architecture diagram]</code></pre>
<h2>API Design</h2>
<pre><code>POST /api/resource</code></pre>
<h2>Database Schema</h2>
<pre><code>CREATE TABLE example (...)</code></pre>
<h2>Testing Strategy</h2>
<ul><li>Unit Tests: </li><li>Load Tests: </li></ul>`,
  },
  {
    id: "okrs",
    title: "OKRs & Goals",
    description: "Objectives and key results",
    icon: <TrendingUp className="w-8 h-8 text-pink-500" />,
    category: "Planning",
    content: `<h1>OKRs (Objectives & Key Results)</h1>
<p><strong>Quarter:</strong> Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}</p>
<h2>Objective 1: [Inspiring Goal]</h2>
<h3>Key Results</h3>
<ul data-type="taskList">
  <li data-checked="false"><label><input type="checkbox"><span></span></label><div><strong>KR1:</strong> [Measurable outcome]</div></li>
  <li data-checked="false"><label><input type="checkbox"><span></span></label><div><strong>KR2:</strong> [Measurable outcome]</div></li>
</ul>
<p><strong>Progress:</strong> ▓▓▓▓▓░░░░░ 50%</p>`,
  },
  {
    id: "brainstorm",
    title: "Brainstorming",
    description: "Creative brainstorming session",
    icon: <Lightbulb className="w-8 h-8 text-yellow-400" />,
    category: "Creative",
    content: `<h1>Brainstorming Session</h1>
<p><strong>Topic:</strong> </p>
<h2>Ideas</h2>
<h3>💡 Idea 1</h3>
<p></p>
<h3>💡 Idea 2</h3>
<p></p>
<h2>Top Ideas (Voted)</h2>
<ol><li>⭐⭐⭐⭐⭐ </li><li>⭐⭐⭐⭐ </li></ol>
<h2>Next Steps</h2>
<ul data-type="taskList">
  <li data-checked="false"><label><input type="checkbox"><span></span></label><div></div></li>
</ul>`,
  },
  {
    id: "interview-notes",
    title: "Interview Notes",
    description: "Candidate interview template",
    icon: <MessageSquare className="w-8 h-8 text-cyan-500" />,
    category: "HR",
    content: `<h1>Interview Notes</h1>
<p><strong>Candidate:</strong> </p>
<p><strong>Position:</strong> </p>
<h2>Questions & Responses</h2>
<h3>Question 1</h3>
<p><strong>Response:</strong></p>
<h2>Overall Assessment</h2>
<table>
  <tr><td>Category</td><td>Rating (1-5)</td><td>Notes</td></tr>
  <tr><td>Technical Skills</td><td>⭐⭐⭐⭐⭐</td><td></td></tr>
</table>
<h2>Recommendation</h2>
<ul data-type="taskList">
  <li data-checked="false"><label><input type="checkbox"><span></span></label><div>Yes</div></li>
</ul>`,
  },
  {
    id: "bug-report",
    title: "Bug Report",
    description: "Detailed bug documentation",
    icon: <Bug className="w-8 h-8 text-red-500" />,
    category: "Engineering",
    content: `<h1>Bug Report</h1>
<p><strong>Severity:</strong> 🔴 Critical</p>
<h2>Description</h2>
<p></p>
<h2>Steps to Reproduce</h2>
<ol><li></li><li></li></ol>
<h2>Expected Behavior</h2>
<p></p>
<h2>Actual Behavior</h2>
<p></p>
<h2>Error Messages</h2>
<pre><code>[Paste logs here]</code></pre>`,
  },
  {
    id: "research-notes",
    title: "Research Notes",
    description: "Research and analysis notes",
    icon: <BookOpen className="w-8 h-8 text-emerald-500" />,
    category: "Research",
    content: `<h1>Research Notes</h1>
<p><strong>Topic:</strong> </p>
<h2>Research Question</h2>
<p></p>
<h2>Key Findings</h2>
<h3>Finding 1</h3>
<p></p>
<h2>Data & Evidence</h2>
<table>
  <tr><td>Source</td><td>Key Points</td><td>Reliability</td></tr>
  <tr><td></td><td></td><td></td></tr>
</table>`,
  },
];

const TemplatesModal = React.memo(({
  open,
  onClose,
  onSelectTemplate,
}: TemplatesModalProps) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  if (!open) return null;

  const filteredTemplates = React.useMemo(() => 
    templates.filter(
      (template) =>
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  [searchQuery]);

  const handleSelect = (templateId: string) => {
    onSelectTemplate(templateId);
    onClose();
    setSearchQuery("");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1A1B26] rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden border border-black/5 dark:border-white/10">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-white/10">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Choose a Template
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filteredTemplates.length} templates available
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-6 pb-4">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Templates Grid */}
        <div className="overflow-y-auto max-h-[calc(85vh-180px)] px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTemplates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                className="h-auto p-5 flex flex-col items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:shadow-md group"
                onClick={() => handleSelect(template.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-shrink-0 group-hover:scale-110 transition-transform">
                    {template.icon}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {template.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {template.category}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 text-left line-clamp-2">
                  {template.description}
                </div>
              </Button>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No templates found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default TemplatesModal;
export { templates };
