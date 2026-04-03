import type { State } from '../../index'
import type { Ad } from '../../../types/ad'
import { NameSpace } from '../../../const'

export const getAd = (state: State): Ad | null => state[NameSpace.SINGLE_AD].ad

export const getIsFetchingAdStatus = (state: State): boolean => state[NameSpace.SINGLE_AD].isFetchingAdStatus