import * as React from "react";
// @ts-ignore
import { __RouterContext, RouteComponentProps } from "react-router-dom";
import { Store } from 'redux';

export const getHux = function <State>(store: Store<State>) {
  /**
   * @todo should probably fix this..?
   */
  const HuxContext = React.createContext<Store<State>>(null as any);

  // Dispatches don't need to be a hook, and shouldn't really be exposed directly; a core set of hooks can get the store 
  // object and call dispatch on it given pre-determined functionality.

  // const useDispatch = <CreatedAction extends Redux.AnyAction, ActionCreatorArgs extends any[]>(actionCreator: (...actionCreatorArgs: ActionCreatorArgs) => CreatedAction) => {
  //   const huxContext = React.useContext(HuxContext)

  //   if (!huxContext) {
  //     return
  //   }

  //   const { dispatch } = huxContext

  //   return (...actionCreatorArgs: ActionCreatorArgs) => {
  //     return dispatch<CreatedAction>(actionCreator(...actionCreatorArgs));
  //   }
  // }

  const useHuxSelector = function <SelectedState>(selector: (state: State) => SelectedState): SelectedState {
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

    React.useEffect(() => subscribe(listener))
    return value
  }

  const Provider: React.FC = ({ children }) => <HuxContext.Provider value={store}>{children}</HuxContext.Provider>

  return {
    Provider,
    useHuxSelector
  }
}