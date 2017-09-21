import { createReducer } from '../utils';

import {
  GET_ARTIFACTS_REQUEST,
  GET_ARTIFACTS_SUCCESS,
  GET_ARTIFACTS_FAILURE,

  CREATE_ARTIFACT_REQUEST,
  CREATE_ARTIFACT_SUCCESS,
  CREATE_ARTIFACT_FAILURE,

  DELETE_ARTIFACT_REQUEST,
  DELETE_ARTIFACT_SUCCESS,
  DELETE_ARTIFACT_FAILURE,
} from './constants';

const setIsFetching = (state) => (
  Object.assign({}, state, {
    isFetching: true,
  })
);

const setIsNotFetching = (state) => (
  Object.assign({}, state, {
    isFetching: false,
  })
);

const setArtifactsList = (state, action) => (
  Object.assign({}, state, {
    isFetching: false,
    artifactList: action.list,
    message: '',
    messageType: '',
  })
);

const setError = (state, action) => (
  Object.assign({}, state, {
    isFetching: false,
    message: action.error.message,
    messageType: 'error'
  })
);

const defaultState = {
  isFetching: false,
  artifactList: {},
  message: '',
  messageType: '',
};

export default createReducer(defaultState, {
  [GET_ARTIFACTS_REQUEST]: setIsFetching,
  [GET_ARTIFACTS_SUCCESS]: setArtifactsList,
  [GET_ARTIFACTS_FAILURE]: setError,

  [CREATE_ARTIFACT_REQUEST]: setIsFetching,
  [CREATE_ARTIFACT_SUCCESS]: setIsNotFetching,
  [CREATE_ARTIFACT_FAILURE]: setError,

  [DELETE_ARTIFACT_REQUEST]: state => state,
  [DELETE_ARTIFACT_SUCCESS]: state => state,
  [DELETE_ARTIFACT_FAILURE]: state => state,
});
