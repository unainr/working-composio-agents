import { AgentList } from "@/components/agents/components/AgentList";
import { CreateAgentForm } from "@/components/agents/components/agents-form";


const HomePage = () => {
	return (
		<>
		<CreateAgentForm />
		<AgentList/>
		</>
	);
};

export default HomePage;
