"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  useEnrichedAccountBalancesRecipeInMarket,
  useEnrichedAccountBalancesVaultInMarket,
} from "royco/hooks";
import { useActiveMarket } from "../hooks";
import { useAccount } from "wagmi";
import { isEqual, set } from "lodash";
import { produce } from "immer";
import {
  BASE_MARGIN_TOP,
  BASE_PADDING,
  INFO_ROW_CLASSES,
  PrimaryLabel,
  TertiaryLabel,
} from "../composables";
import { MarketType, MarketUserType, useMarketManager } from "@/store";
import { SpringNumber } from "@/components/composables";
import { AlertIndicator, InfoCard, TokenDisplayer } from "@/components/common";

export const BalanceIndicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { address, isConnected } = useAccount();

  const { marketMetadata, currentMarketData } = useActiveMarket();
  const { userType } = useMarketManager();

  /**
   * Recipe balances for AP & IP
   */
  const {
    isLoading: isLoadingRecipe,
    isRefetching: isRefetchingRecipe,
    data: dataRecipe,
  } = useEnrichedAccountBalancesRecipeInMarket({
    chain_id: marketMetadata.chain_id,
    market_id: marketMetadata.market_id,
    account_address: address ? address.toLowerCase() : "",
    custom_token_data: undefined,
  });

  /**
   * Vault balances for IP
   */
  const {
    isLoading: isLoadingVault,
    isRefetching: isRefetchingVault,
    data: dataVault,
  } = useEnrichedAccountBalancesVaultInMarket({
    chain_id: marketMetadata.chain_id,
    market_id: marketMetadata.market_id,
    account_address: address ? address.toLowerCase() : "",
    custom_token_data: undefined,
  });

  /**
   * Placeholder data
   */
  const [placeholderData, setPlaceholderData] = React.useState<
    Array<typeof dataRecipe | typeof dataVault | undefined>
  >([undefined, undefined]);

  /**
   * @effect Update placeholder data for recipe
   */
  useEffect(() => {
    if (
      marketMetadata.market_type === MarketType.recipe.id &&
      isLoadingRecipe === false &&
      isRefetchingRecipe === false &&
      !isEqual(dataRecipe, placeholderData[1])
    ) {
      setPlaceholderData((prevDatas) => {
        return produce(prevDatas, (draft) => {
          if (!isEqual(draft[1], dataRecipe)) {
            draft[0] = draft[1] as typeof dataRecipe;
            draft[1] = dataRecipe as typeof dataRecipe;
          }
        });
      });
    }
  }, [isLoadingRecipe, isRefetchingRecipe, dataRecipe]);

  /**
   * @effect Update placeholder data for vault
   */
  useEffect(() => {
    if (
      marketMetadata.market_type === MarketType.vault.id &&
      isLoadingVault === false &&
      isRefetchingVault === false &&
      !isEqual(dataVault, placeholderData[1])
    ) {
      setPlaceholderData((prevDatas) => {
        return produce(prevDatas, (draft) => {
          if (!isEqual(draft[1], dataVault)) {
            draft[0] = draft[1] as typeof dataVault;
            draft[1] = dataVault as typeof dataVault;
          }
        });
      });
    }
  }, [isLoadingVault, isRefetchingVault, dataVault]);

  if (!currentMarketData) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-fit w-full shrink-0 flex-col",
        BASE_PADDING,
        className
      )}
      {...props}
    >
      <TertiaryLabel>BALANCES</TertiaryLabel>

      {/**
       * Total balance for recipe
       */}
      {placeholderData[1] && (
        <PrimaryLabel className={cn("text-3xl font-light", BASE_MARGIN_TOP.XL)}>
          <SpringNumber
            previousValue={
              placeholderData[0]
                ? userType === MarketUserType.ap.id
                  ? placeholderData[0].balance_usd_ap
                  : placeholderData[0].balance_usd_ip
                : 0
            }
            currentValue={
              placeholderData[1]
                ? userType === MarketUserType.ap.id
                  ? placeholderData[1].balance_usd_ap
                  : placeholderData[1].balance_usd_ip
                : 0
            }
            numberFormatOptions={{
              style: "currency",
              currency: "USD",
              notation: "standard",
              useGrouping: true,
              minimumFractionDigits: 2,
              maximumFractionDigits: 8,
            }}
          />
        </PrimaryLabel>
      )}

      {isConnected === false && (
        <AlertIndicator className="pb-2 pt-7">
          Wallet not connected
        </AlertIndicator>
      )}

      {isConnected === true &&
        isLoadingRecipe === false &&
        isLoadingVault === false &&
        (placeholderData[1] === undefined || placeholderData[1] === null) && (
          <AlertIndicator className="pb-2 pt-7">
            No activity found
          </AlertIndicator>
        )}

      {/**
       * Show total balance
       */}

      {isConnected &&
        placeholderData[1] !== undefined &&
        placeholderData[1] !== null && (
          <InfoCard className={cn("flex flex-col gap-1", BASE_MARGIN_TOP.XL)}>
            {/**
             * @info Input Token
             */}
            <InfoCard.Row className={cn(INFO_ROW_CLASSES, "gap-0")}>
              <InfoCard.Row.Key>Input Token</InfoCard.Row.Key>
              <InfoCard.Row.Value className="gap-0">
                <SpringNumber
                  className="h-4"
                  spanClassName="leading-5"
                  previousValue={0}
                  currentValue={
                    userType === MarketUserType.ap.id
                      ? (placeholderData[1]?.input_token_data_ap
                          ?.token_amount ?? 0)
                      : (placeholderData[1]?.input_token_data_ip
                          ?.token_amount ?? 0)
                  }
                  numberFormatOptions={{
                    style: "decimal",
                    notation: "standard",
                    useGrouping: true,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 8,
                  }}
                />

                <TokenDisplayer
                  imageClassName="hidden"
                  size={4}
                  hover
                  bounce
                  tokens={
                    placeholderData[1]?.input_token_data_ap
                      ? [placeholderData[1].input_token_data_ap]
                      : []
                  }
                  symbols={true}
                />
                <TokenDisplayer
                  className="ml-2"
                  size={4}
                  hover
                  bounce
                  tokens={
                    placeholderData[1]?.input_token_data_ip
                      ? [placeholderData[1].input_token_data_ip]
                      : []
                  }
                  symbols={false}
                />
              </InfoCard.Row.Value>
            </InfoCard.Row>

            {/**
             * @info Incentives AP/IP
             */}
            <InfoCard.Row className={cn(INFO_ROW_CLASSES)}>
              <InfoCard.Row.Key>Incentives</InfoCard.Row.Key>
              <InfoCard.Row.Value className="flex h-fit grow flex-col gap-1">
                {placeholderData[1]?.[
                  userType === MarketUserType.ap.id
                    ? "incentives_ap_data"
                    : "incentives_ip_data"
                ].length === 0 ? (
                  <InfoCard.Row.Value className="flex w-full flex-row place-content-end items-end gap-0">
                    0.00
                  </InfoCard.Row.Value>
                ) : null}

                {placeholderData[1]?.[
                  userType === MarketUserType.ap.id
                    ? "incentives_ap_data"
                    : "incentives_ip_data"
                ].map((incentive, index) => {
                  const BASE_KEY = `market:balance-indicator:balance-incentice-type:${userType}:incentive:${incentive.id}`;

                  return (
                    <InfoCard.Row.Value
                      key={BASE_KEY}
                      className="flex w-full flex-row place-content-end items-end gap-1"
                    >
                      <SpringNumber
                        className="h-4"
                        spanClassName="leading-5"
                        previousValue={0}
                        currentValue={incentive.token_amount}
                        numberFormatOptions={{
                          style: "decimal",
                          notation: "standard",
                          useGrouping: true,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 8,
                        }}
                      />

                      <TokenDisplayer
                        imageClassName="hidden"
                        size={4}
                        hover
                        bounce
                        tokens={[incentive]}
                        symbols={true}
                      />
                      <TokenDisplayer
                        className="ml-2"
                        size={4}
                        hover
                        bounce
                        tokens={[incentive]}
                        symbols={false}
                      />
                    </InfoCard.Row.Value>
                  );
                })}
              </InfoCard.Row.Value>
            </InfoCard.Row>
          </InfoCard>
        )}
    </div>
  );
});
