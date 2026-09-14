import { billingKey } from "@/hooks/use-billing";
import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono/client";


import { toast } from "sonner";


type ResponseType = InferResponseType<
	(typeof client.api.agents)[":id"]["$delete"]
>;


export const useDeleteAgent = ({ agentId }: { agentId: string }) => {
    const queryClient = useQueryClient();
   return useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.agents[":id"]["$delete"]({
       param:{id:agentId}
      })
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
       queryClient.invalidateQueries({
        queryKey: billingKey,
      });
    },
  });
}
