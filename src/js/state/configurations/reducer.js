import { createReducer } from '../utils';

import {
  GET_CONFIGURATIONS_REQUEST,
  GET_CONFIGURATIONS_SUCCESS,
  GET_CONFIGURATIONS_FAILURE,

  SAVE_CONFIGURATION_REQUEST,
  SAVE_CONFIGURATION_SUCCESS,
  SAVE_CONFIGURATION_FAILURE,

  DELETE_CONFIGURATION_REQUEST,
  DELETE_CONFIGURATION_SUCCESS,
  DELETE_CONFIGURATION_FAILURE,

  CLEAR_CONFIGURATION_MESSAGE
} from './constants';

const setIsFetching = (state) => (
  Object.assign({}, state, {
    isFetching: true,
  })
);

const setConfigurationsList = (state, action) => (
  Object.assign({}, state, {
    isFetching: false,
    configurationList: action.list,
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

const setSaveSuccess = (state, action) => (
  Object.assign({}, state, {
    isFetching: false,
    message: `${action.data.configTitle} has been saved!`,
    messageType: 'success',
  })
);

const clearMessage = (state) => (
  Object.assign({}, state, {
    message: '',
    messageType: '',
  })
)

const unsetCurrentConfiguration = (state, action) => (
  Object.assign({}, state, {
    isFetching: false,
    currentConfiguration: null,
    message: '',
    messageType: '',
  })
);

const defaultState = {
  isFetching: false,
  configurationList: {},
  message: '',
  messageType: '',
};

export default createReducer(defaultState, {
  [GET_CONFIGURATIONS_REQUEST]:   setIsFetching,
  [GET_CONFIGURATIONS_SUCCESS]:   setConfigurationsList,
  [GET_CONFIGURATIONS_FAILURE]:   setError,

  [SAVE_CONFIGURATION_REQUEST]:   setIsFetching,
  [SAVE_CONFIGURATION_SUCCESS]:   setSaveSuccess,
  [SAVE_CONFIGURATION_FAILURE]:   setError,

  [DELETE_CONFIGURATION_REQUEST]: setIsFetching,
  [DELETE_CONFIGURATION_SUCCESS]: unsetCurrentConfiguration,
  [DELETE_CONFIGURATION_FAILURE]: setError,

  [CLEAR_CONFIGURATION_MESSAGE]: clearMessage,
});
