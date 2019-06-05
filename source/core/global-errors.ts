// import * as React from "react"

// import { delay } from './async'
// import { coreListen } from './listen'
// import { CoreActionUnion, coreActionCreators } from './actions';

// export interface GlobalError {

// }

// type GlobalErrorsState = GlobalError[]


// export const globalErrorsReducer = (state: GlobalErrorsState = [], action: CoreActionUnion): GlobalErrorsState => {
//     switch (action.type) {
//         case "pushGlobalError": {
//             return [...state, action.error]
//         }
//         case "shiftGlobalError": {
//             const [first, ...rest] = state
//             return rest
//         }
//         default: {
//             return state
//         }
//     }
// }

// /**
//  * A hook for initialising the global error handler.
//  * This should only be called once, in the root component of an application - this could be enforced by throwing an error if called more than once...
//  * @todo type store
//  */
// export const getUseGlobalErrors = (store) => React.useEffect(() => {
//     const { dispatch } = store

//     const handleErrors = async () => {
//         while (true) {
//             await coreListen("pushGlobalError")
//             await delay(2000)
//             dispatch(coreActionCreators.shiftGlobalError({}))
//         }
//     }

//     handleErrors()
// }, [])