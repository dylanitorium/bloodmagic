import { createReducer } from '../utils';

import {
  AUTH_USER_REQUEST,
  AUTH_USER_SUCCESS,
  AUTH_USER_FAILURE,
  UNAUTH_USER_REQUEST,
  UNAUTH_USER_SUCCESS,
  UNAUTH_USER_FAILURE,
  GET_EXTRA_DATA_SUCCESS,
} from './constants';

const setFetching = (state, action) => {
  return Object.assign({}, state, {
    isFetching: true,
  });
};

const setUser = (state, action) => {
  return Object.assign({}, state, {
    isFetching: false,
    currentUser: action.user,
  });
};

const setExtraData = (state, action) => {
  return Object.assign({}, state, {
    exportCount: action.data.exportCount,
    downloadCount: action.data.downloadCount,
  });
}

const setNoUser = (state, action) => {
  return Object.assign({}, state, {
    isFetching: false,
    currentUser: null,
    token: null,
  });
};

export default createReducer({
  isFetching: false,
  currentUser: null,
}, {
  [AUTH_USER_REQUEST]: setFetching,
  [AUTH_USER_SUCCESS]: setUser,
  [AUTH_USER_FAILURE]: setNoUser,

  [UNAUTH_USER_REQUEST]: setFetching,
  [UNAUTH_USER_SUCCESS]: setNoUser,
  [UNAUTH_USER_FAILURE]: setNoUser,

  [GET_EXTRA_DATA_SUCCESS]: setExtraData,
});

