import { cn } from "@/lib/utils";
import React, { Fragment } from "react";
import { useActiveMarket } from "../hooks";
import {
  BASE_MARGIN_TOP,
  BASE_PADDING,
  BASE_PADDING_LEFT,
  BASE_PADDING_RIGHT,
  SecondaryLabel,
  TertiaryLabel,
} from "../composables";

import { SpringNumber } from "@/components/composables";
import { AlertIndicator, TokenDisplayer } from "@/components/common";
import { FallMotion } from "@/components/animations";
import { RoycoMarketType } from "royco/market";
import { EnrichedOfferDataType } from "royco/queries";
import { MarketUserType } from "@/store";
import { parseRawAmountToTokenAmount } from "royco/utils";

export const CentralBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { currentMarketData, marketMetadata } = useActiveMarket();

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-none shrink-0 flex-row items-center justify-between border-y border-divider",
        BASE_PADDING_LEFT,
        BASE_PADDING_RIGHT,
        "py-2",
        className
      )}
      {...props}
    >
      <SecondaryLabel className="font-medium text-black">
        {/**
         * @TODO
         * For Recipe, this should be currentMarketData.quantity_value_usd
         * For Vault, this needs to be calculated
         */}
        {Intl.NumberFormat("en-US", {
          // style: "currency",
          // currency: "USD",
          notation: "standard",
          useGrouping: true,
          minimumFractionDigits: 2,
          maximumFractionDigits: 8,
        }).format(
          marketMetadata.market_type === RoycoMarketType.recipe.id
            ? parseRawAmountToTokenAmount(
                currentMarketData?.quantity_ap ?? "",
                currentMarketData?.input_token_data.decimals ?? 0
              ) +
                parseRawAmountToTokenAmount(
                  currentMarketData?.quantity_ip ?? "",
                  currentMarketData?.input_token_data.decimals ?? 0
                )
            : parseRawAmountToTokenAmount(
                currentMarketData?.quantity_ap ?? "",
                currentMarketData?.input_token_data.decimals ?? 0
              )
          // marketMetadata.market_type === RoycoMarketType.recipe.id
          //   ? (currentMarketData?.quantity_ap_usd ?? 0) +
          //       (currentMarketData?.quantity_ip_usd ?? 0)
          //   : (currentMarketData?.quantity_ap_usd ?? 0)
        )}
      </SecondaryLabel>

      <SecondaryLabel className="font-medium text-black">
        OPEN INTEREST
      </SecondaryLabel>
    </div>
  );
});

const OfferListRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    type: "ap" | "ip";
    indexKey: string;
    customKey: string;
    keyInfo: {
      previousValue: number;
      currentValue: number;
    };
    valueInfo: {
      previousValue: number;
      currentValue: number;
    };
    offer?: EnrichedOfferDataType;
    delay?: number;
  }
>(
  (
    {
      className,
      delay,
      indexKey,
      type,
      customKey,
      keyInfo,
      valueInfo,
      offer,
      ...props
    },
    ref
  ) => {
    return (
      <FallMotion
        delay={delay}
        key={indexKey}
        ref={ref}
        customKey={customKey}
        height="1rem"
        className={cn("w-full", className)}
        contentClassName="flex flex-row items-center justify-between w-full h-4 text-sm"
        {...props}
      >
        <SecondaryLabel>
          <SpringNumber
            defaultColor={type === "ap" ? "text-success" : "text-error"}
            previousValue={keyInfo.previousValue}
            currentValue={keyInfo.currentValue}
            numberFormatOptions={{
              // style: "currency",
              notation: "standard",
              useGrouping: true,
              minimumFractionDigits: 2,
              maximumFractionDigits: 8,
              // currency: "USD",
            }}
          />

          {!!offer && (
            <div className="ml-1">
              <TokenDisplayer
                size={4}
                tokens={[offer?.input_token_data] ?? []}
                symbols={false}
              />
            </div>
          )}
        </SecondaryLabel>
        <SecondaryLabel>
          {!!offer && (
            <div className="mr-0">
              <TokenDisplayer
                size={4}
                tokens={[offer?.tokens_data[0]] ?? []}
                symbols={false}
              />
            </div>
          )}

          <SpringNumber
            previousValue={valueInfo.previousValue}
            currentValue={valueInfo.currentValue}
            numberFormatOptions={{
              // style: "percent",
              notation: "standard",
              useGrouping: true,
              minimumFractionDigits: 2,
              maximumFractionDigits: 8,
            }}
          />
        </SecondaryLabel>
      </FallMotion>
    );
  }
);

export const OfferList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const {
    marketMetadata,
    currentMarketData,
    propsHighestOffers,
    currentHighestOffers,
    previousHighestOffers,
  } = useActiveMarket();

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-[18rem] w-full shrink-0 grow flex-col overflow-hidden",
        marketMetadata.market_type === RoycoMarketType.recipe.id && "pb-5",
        // marketMetadata.market_type === RoycoMarketType.vault.id && "pb-2",
        className
      )}
      {...props}
    >
      <TertiaryLabel className={cn("flex-none shrink-0", BASE_PADDING)}>
        OFFER LIST
      </TertiaryLabel>

      <div
        className={cn(
          "flex w-full flex-none shrink-0 flex-row justify-between",
          BASE_PADDING_LEFT,
          BASE_PADDING_RIGHT
        )}
      >
        <TertiaryLabel className="text-tertiary">SIZE</TertiaryLabel>
        {/* <TertiaryLabel className="text-tertiary">APR</TertiaryLabel> */}
        <TertiaryLabel className="text-tertiary">INCENTIVES</TertiaryLabel>
      </div>

      {/**
       * Show IP offers only for recipe markets
       */}
      {marketMetadata.market_type === RoycoMarketType.recipe.id && (
        <div
          className={cn(
            "flex flex-1 flex-col-reverse overflow-y-scroll",
            "gap-2 py-2",
            BASE_PADDING_LEFT,
            BASE_PADDING_RIGHT,
            BASE_MARGIN_TOP.SM
          )}
        >
          {!!currentHighestOffers &&
          !!currentHighestOffers.ip_offers &&
          currentHighestOffers.ip_offers.length !== 0 ? (
            currentHighestOffers?.ip_offers.map((offer, offerIndex) => {
              const BASE_KEY = `market:offer:${offer.offer_id}-${offer.offer_side}`;
              const INDEX_KEY = `market:offer:${offer.offer_side}:${offerIndex}`;

              const keyInfo = {
                previousValue:
                  !!previousHighestOffers &&
                  offerIndex < previousHighestOffers.ip_offers.length
                    ? (previousHighestOffers?.ip_offers[offerIndex]
                        .input_token_data.token_amount ?? 0)
                    : 0,

                currentValue: offer.input_token_data.token_amount as number,
              };

              // const valueInfo = {
              //   previousValue:
              //     !!previousHighestOffers &&
              //     offerIndex < previousHighestOffers.ip_offers.length
              //       ? (previousHighestOffers?.ip_offers[offerIndex]
              //           .annual_change_ratio ?? 0)
              //       : 0,
              //   currentValue: offer.annual_change_ratio as number,
              // };

              const valueInfo = {
                previousValue:
                  !!previousHighestOffers &&
                  offerIndex < previousHighestOffers.ip_offers.length
                    ? previousHighestOffers?.ip_offers[offerIndex]
                        .tokens_data &&
                      previousHighestOffers?.ip_offers[offerIndex].tokens_data
                        .length > 0
                      ? previousHighestOffers?.ip_offers[offerIndex]
                          .tokens_data[0].token_amount
                      : 0
                    : 0,
                currentValue:
                  offer.tokens_data && offer.tokens_data.length > 0
                    ? offer.tokens_data[0].token_amount
                    : 0,
              };

              return (
                <OfferListRow
                  key={`offer-list-row:${offer.offer_id}`}
                  type="ap"
                  customKey={`${BASE_KEY}:${keyInfo.previousValue}:${keyInfo.currentValue}:${valueInfo.previousValue}:${valueInfo.currentValue}`}
                  indexKey={INDEX_KEY}
                  keyInfo={keyInfo}
                  valueInfo={valueInfo}
                  offer={offer}
                />
              );
            })
          ) : (
            <AlertIndicator className="h-full">No offers yet</AlertIndicator>
          )}
        </div>
      )}

      {/**
       * Central Bar
       */}
      {marketMetadata.market_type === RoycoMarketType.recipe.id && (
        <CentralBar />
      )}

      <div
        className={cn(
          "flex flex-1 flex-col overflow-y-scroll",
          "gap-2 py-2",
          BASE_PADDING_LEFT,
          BASE_PADDING_RIGHT
        )}
      >
        {!!currentHighestOffers &&
        !!currentHighestOffers.ap_offers &&
        currentHighestOffers.ap_offers.length !== 0 ? (
          currentHighestOffers?.ap_offers.map((offer, offerIndex) => {
            const BASE_KEY = `market:offer:${offer.offer_id}-${offer.offer_side}`;
            const INDEX_KEY = `market:offer:${offer.offer_side}:${offerIndex}`;

            const keyInfo = {
              previousValue:
                !!previousHighestOffers &&
                offerIndex < previousHighestOffers.ap_offers.length
                  ? (previousHighestOffers?.ap_offers[offerIndex]
                      .input_token_data.token_amount ?? 0)
                  : 0,

              currentValue: offer.input_token_data.token_amount as number,
            };

            // const valueInfo = {
            //   previousValue:
            //     !!previousHighestOffers &&
            //     offerIndex < previousHighestOffers.ap_offers.length
            //       ? (previousHighestOffers?.ap_offers[offerIndex]
            //           .annual_change_ratio ?? 0)
            //       : 0,
            //   currentValue: offer.annual_change_ratio as number,
            // };

            const valueInfo = {
              previousValue:
                !!previousHighestOffers &&
                offerIndex < previousHighestOffers.ap_offers.length
                  ? previousHighestOffers?.ap_offers[offerIndex].tokens_data &&
                    previousHighestOffers?.ap_offers[offerIndex].tokens_data
                      .length > 0
                    ? previousHighestOffers?.ap_offers[offerIndex]
                        .tokens_data[0].token_amount
                    : 0
                  : 0,
              currentValue:
                offer.tokens_data && offer.tokens_data.length > 0
                  ? offer.tokens_data[0].token_amount
                  : 0,
            };

            return (
              <OfferListRow
                type="ip"
                customKey={`${BASE_KEY}:${keyInfo.previousValue}:${keyInfo.currentValue}:${valueInfo.previousValue}:${valueInfo.currentValue}`}
                indexKey={INDEX_KEY}
                keyInfo={keyInfo}
                valueInfo={valueInfo}
                offer={offer}
              />
            );
          })
        ) : (
          <AlertIndicator className="h-full">No offers yet</AlertIndicator>
        )}
      </div>

      {marketMetadata.market_type === RoycoMarketType.vault.id && (
        <CentralBar className="h-9 border-b-0" />
      )}
    </div>
  );
});
