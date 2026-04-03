import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, State } from './index'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = useSelector.withTypes<State>()
