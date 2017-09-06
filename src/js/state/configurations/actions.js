import * as firebase from 'firebase';
import { push } from 'react-router-redux';

import { makeActionCreator } from '../utils';

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

  CLEAR_CONFIGURATION_MESSAGE,
} from './constants';


export const clearConfigurationMessage = makeActionCreator(CLEAR_CONFIGURATION_MESSAGE);

const getConfigurationsRequest = makeActionCreator(GET_CONFIGURATIONS_REQUEST);
const getConfigurationsSuccess = makeActionCreator(GET_CONFIGURATIONS_SUCCESS, 'list');
const getConfigurationsFailure = makeActionCreator(GET_CONFIGURATIONS_FAILURE, 'error');

/**
 * This should only really run just the once - when the app mounts
 */
export const getConfigurations = () => (
  (dispatch, getState) => {
    dispatch(getConfigurationsRequest());

    // Get user from state
    try {
      const { user: { currentUser: { uid } } } = getState();

      if (!uid) {
        dispatch(getConfigurationsFailure(error));
      }

      // Create reference
      const reference = firebase.database().ref('configurations').orderByChild('user').equalTo(uid);

      // Then follow up by listening to changes
      reference.on('value', (snapshot) => {
        dispatch(getConfigurationsSuccess(snapshot.val()));
      });
    } catch (error) {
      dispatch(getConfigurationsFailure(error));
    }
  }
);

const saveConfigurationRequest = makeActionCreator(SAVE_CONFIGURATION_REQUEST, 'data');
const saveConfigurationSuccess = makeActionCreator(SAVE_CONFIGURATION_SUCCESS, 'data');
const saveConfigurationFailure = makeActionCreator(SAVE_CONFIGURATION_FAILURE, 'error');

/**
 * Handles create AND save of configuration data. Key is included in this data
 * @param data
 */
export const saveConfiguration = data => (
  (dispatch) => {
    dispatch(saveConfigurationRequest(data));

    console.log(data);

    try {
      // Get the key
      const { key } = data;
      if (!key) {
        dispatch(saveConfigurationFailure('No key'));
      }

      console.log(key);

      // Create reference
      const reference = firebase.database().ref(`configurations/${key}`);

      // Set the data
      reference.set(data)
        .then(() => dispatch(saveConfigurationSuccess(data)))
        .catch(error => dispatch(saveConfigurationFailure(error)));
    } catch (error) {
      dispatch(saveConfigurationFailure(error));
    }
  }
);

const deleteConfigurationRequest = makeActionCreator(DELETE_CONFIGURATION_REQUEST, 'id');
const deleteConfigurationSuccess = makeActionCreator(DELETE_CONFIGURATION_SUCCESS);
const deleteConfigurationFailure = makeActionCreator(DELETE_CONFIGURATION_FAILURE, 'error');

/**
 * Delete it - pass the id for debugging purposes
 * @param id
 */
export const deleteConfiguration = (id) => (
  (dispatch) => {
    dispatch(deleteConfigurationRequest(id));

    try {
      // Check ID
      if (!id) {
        dispatch(deleteConfigurationFailure('No id'));
      }

      // Create reference
      const reference = firebase.database().ref('configurations/' + id);

      // Remove reference
      reference.remove()
        .then(() => dispatch(deleteConfigurationSuccess()))
        .catch(error => dispatch(deleteConfigurationFailure(error)));
    } catch (error) {
      dispatch(deleteConfigurationFailure(error));
    }
  }
);



