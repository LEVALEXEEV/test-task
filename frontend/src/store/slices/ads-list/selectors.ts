import type { State } from "../../index";
import type { CompactAd } from "../../../types/compact-ad";
import { NameSpace } from "../../../const";

export const getAds = (state: State): CompactAd[] =>
  state[NameSpace.ADS].ads;

export const getAdsTotal = (state: State): number =>
  state[NameSpace.ADS].total;

export const getIsFetchingAdsStatus = (state: State): boolean =>
  state[NameSpace.ADS].isFetchingAdsStatus;