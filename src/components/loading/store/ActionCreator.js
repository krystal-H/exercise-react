import * as ActionTypes from './ActionTypes';


export const loadingShowStatu= (statu) => {
  return {
    type: ActionTypes.LOADING_TEST,
    statu
  }
}