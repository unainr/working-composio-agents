import { AgentList } from "@/components/agents/components/AgentList";
import { CreateAgentDialog } from "@/components/agents/components/agents-form";



const HomePage = () => {
	return (
		<>
		<CreateAgentDialog />
		<AgentList/>
		</>
	);
};

export default HomePage;
