import {
	PromptInputProvider,
	usePromptInputController,
} from "@/components/ai-elements/prompt-input";
import { SpeechInput } from "@/components/ai-elements/speech-input";

export function VoiceButton({ disabled }: { disabled?: boolean }) {
	const { textInput } = usePromptInputController();

	return (
		<SpeechInput
			size="icon-sm"
			variant="ghost"
			disabled={disabled}
			onTranscriptionChange={(text) =>
				textInput.setInput(`${textInput.value} ${text}`.trim())
			}
		/>
	);
}