import { ACTIONS } from './session.actions';
import { Reducer } from 'redux';

export enum SESSION_STATE {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  AUTHENTICATING = 'AUTHENTICATING',
  AUTHENTICATED = 'AUTHENTICATED',
  AUTH_FAILED = 'AUTH_FAILED',
  LOGGED_OUT = 'LOGGED_OUT'
}

export interface DefaultState {
  token: string | null,
  status: SESSION_STATE
}

export const defaultState = {
  token: null,
  status: SESSION_STATE.UNAUTHENTICATED
};

const reducer: Reducer = (state = defaultState, action) => {
  switch (action.type) {
  	case ACTIONS.SESSION_FETCH_REQUEST:
  		return {...state, token: action.token, status: SESSION_STATE.AUTHENTICATING };
  	case ACTIONS.SESSION_FETCH_SUCCESS:
  		return {...state, token: action.token, status: SESSION_STATE.AUTHENTICATED };
  	case ACTIONS.SESSION_FETCH_FAILURE:
  		return {...state, token: null, status: SESSION_STATE.AUTH_FAILED };
    default: return state;
  }
};

export default reducer;
