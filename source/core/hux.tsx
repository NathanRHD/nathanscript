import * as React from "react";
// @ts-ignore
import { __RouterContext, RouteComponentProps } from "react-router-dom";
import { Store } from 'redux';

export type HuxSelectorHook<State> = <SelectedState>(selector: (state: State) => SelectedState) => SelectedState

export const getHux = function <State>(store: Store<State>) {
  /**
   * @todo should probably fix this..?
   */
  const HuxContext = React.createContext<Store<State>>(store);

  const useHuxSelector: HuxSelectorHook<State> = selector => {
    const huxContext = React.useContext(HuxContext)
    const { subscribe, getState } = huxContext

    const select = () => selector(getState())

    const initial = select()
    const [value, update] = React.useState(initial)

    const listener = () => {
      const next = select()

      if (next !== value) {
        update(next)
      }
    }

    React.useEffect(() => { subscribe(listener) })
    return value
  }

  const Provider: React.FC = ({ children }) => <HuxContext.Provider value={store}>{children}</HuxContext.Provider>

  return {
    Provider,
    useHuxSelector
  }
}