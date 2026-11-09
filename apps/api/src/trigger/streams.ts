import { streams } from "@trigger.dev/sdk";
import type { UIMessageChunk } from "ai";

export const aiStream = streams.define<UIMessageChunk>({ id: "ai" });