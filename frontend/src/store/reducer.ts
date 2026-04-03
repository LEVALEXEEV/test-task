import { combineReducers } from "@reduxjs/toolkit";
import { adsSlice } from "./slices/ads-list";
import { adSlice } from "./slices/single-ad";
import { NameSpace } from "../const";

export const reducer = combineReducers({
    [NameSpace.ADS]: adsSlice.reducer,
    [NameSpace.SINGLE_AD]: adSlice.reducer,
})