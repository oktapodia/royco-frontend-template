import { type TypedRoycoClient } from "royco/client";
import type { Tables } from "royco/types";
import { getRandomMultiplier } from "royco/utils";

export type RoycoStats = Pick<
  Tables<"royco_stats">,
  "tvl" | "volume" | "rewards"
>;

export const getRoycoStatsQueryOptions = (client: TypedRoycoClient) => ({
  queryKey: ["royco-stats"],
  queryFn: async () => {
    return client
      .from("royco_stats")
      .select("tvl, volume, rewards")
      .single()
      .throwOnError()
      .then((result) => result.data);
  },
  keepPreviousData: true,
  placeholderData: (previousData: any) => previousData,
  staleTime: 1000 * 60, // 60 seconds
  refetchOnWindowFocus: false,
  refreshInBackground: true,
});
