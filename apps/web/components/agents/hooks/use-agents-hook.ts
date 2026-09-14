import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono/client";
import { client } from "@/lib/hono";
import { billingKey } from "@/hooks/use-billing";

type ResponseType = InferResponseType<typeof client.api.agents.$post, 201>;
type RequestType = InferRequestType<typeof client.api.agents.$post>["json"];

export const useCreateAgents = () => {
	const queryClient = useQueryClient();
	return useMutation<ResponseType, Error, RequestType>({
		mutationFn: async (json) => {
			const response = await client.api.agents.$post({ json });

			if (!response.ok) {
				throw new Error("Failed to create Agent");
			}

			return await response.json();
		},

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agents"] });
			 // Refresh billing/navbar
      queryClient.invalidateQueries({
        queryKey: billingKey,
      });
		},
	});
};



export function useAgentsGet() {
	return useQuery({
		queryKey: ["agents"],
		queryFn: async () => {
			const res = await client.api.agents.$get();
			if (!res.ok) throw new Error("Failed to fetch agents");
			return res.json();
		},
	});
}