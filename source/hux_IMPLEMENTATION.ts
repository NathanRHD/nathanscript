import { getHux } from './core/hux'
import { State, store } from './store_IMPLEMENTATION'

export const hux = getHux<State>(store)