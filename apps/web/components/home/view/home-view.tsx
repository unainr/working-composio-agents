import ResearchBentoGrid from "../components/features";
import AmanisesHero from "../components/hero-section";

import PricingSection from "../components/client-pricing";
import Faq from "../components/faq";
import ShaderLumin from "../components/shader-lumin";
import IntegrationsSection from "../components/tools-card";


export const Homeview = () => {
	return (
		<>
			<AmanisesHero />
			<ResearchBentoGrid />
			
			<IntegrationsSection/>
			<ShaderLumin/>
			<PricingSection signInHref="/sign-in" />
			<Faq/>
		</>
	);
};
