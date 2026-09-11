import { ChatWindow } from "@/components/chat-window";
import { ToolkitPanel } from "@/components/toolkit-panel";
import { ChatSidebar } from "@/components/chat-sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AgentList } from "@/components/agents/components/AgentList";

/**
 * /agent
 *
 * Left:  Tabs — ChatSidebar (conversation history) | ToolkitPanel (connect/disconnect apps)
 * Right: ChatWindow — streaming chat with the agent
 */
export default function AgentPage() {
  return (
    // Subtract your actual header height. Measure it in devtools if unsure —
    // looked like ~64px in your screenshot, adjust if different.
    <div className="my-20">
      {/* Sidebar */}
      		<AgentList/>

    </div>
  );
}