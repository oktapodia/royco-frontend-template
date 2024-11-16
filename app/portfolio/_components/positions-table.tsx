"use client";

import React, { useState } from "react";

import { useAccount } from "wagmi";
import { LoadingSpinner } from "@/components/composables";
import { motion } from "framer-motion";
import { useEnrichedPositionsRecipe } from "../../../sdk/hooks";
import { StatsDataTable } from "../../market/[chain_id]/[market_type]/[market_id]/_components/stats-tables/stats-data-table";
import { positionsColumns } from "./postions-table-columns";
import { TertiaryLabel } from "../../market/[chain_id]/[market_type]/[market_id]/_components/composables";

export const PositionsTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { address } = useAccount();

  const [pageIndex, setPageIndex] = useState(0);

  const { isLoading, data, isError, error } = useEnrichedPositionsRecipe({
    chain_id: undefined,
    market_id: undefined,
    account_address: (address?.toLowerCase() as string) ?? "",
    page_index: pageIndex,
  });

  let totalCount = data?.count || 0;

  if (isLoading) {
    return (
      <div className="flex w-full grow flex-col place-content-center items-center">
        <LoadingSpinner className="h-5 w-5" />
      </div>
    );
  } else if (!totalCount) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex h-80 w-full flex-col place-content-center items-center gap-2 rounded-2xl border border-divider bg-white p-5 text-lg text-secondary"
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-badge-alert h-14 w-14 text-secondary"
          initial={{ opacity: 0, filter: "blur(5px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(5px)" }}
          transition={{ duration: 1 }}
        >
          <motion.path
            initial={{ pathLength: 0, pathOffset: -1 }}
            animate={{ pathLength: 1, pathOffset: 0 }}
            exit={{ pathLength: 0, pathOffset: -1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
          />
          <motion.line
            initial={{ pathLength: 0, pathOffset: -1 }}
            animate={{ pathLength: 1, pathOffset: 0 }}
            exit={{ pathLength: 0, pathOffset: -1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            x1="12"
            x2="12"
            y1="8"
            y2="12"
          />
          <motion.line
            initial={{ pathLength: 0, pathOffset: -1 }}
            animate={{ pathLength: 1, pathOffset: 0 }}
            exit={{ pathLength: 0, pathOffset: -1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            x1="12"
            x2="12.01"
            y1="16"
            y2="16"
          />
        </motion.svg>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="heading-2 mt-2 text-secondary"
        >
          No positions found
        </motion.div>
      </motion.div>
    );
  } else {
    return (
      <div className="p w- overflow-y-scroll rounded-2xl border border-divider bg-white">
        <TertiaryLabel className="mb-5 mt-5 px-5">POSITIONS</TertiaryLabel>

        <StatsDataTable
          pagination={{
            currentPage: pageIndex,
            totalPages: Math.ceil(totalCount / 20),
            setPage: setPageIndex,
          }}
          columns={positionsColumns}
          data={data && data.data ? data.data : []}
        />
      </div>
    );
  }
});