import * as firebase from 'firebase';
import { push } from 'react-router-redux';
import 'isomorphic-fetch';
import moment from 'moment';

import { makeActionCreator } from '../utils';

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


const getArtifactsRequest = makeActionCreator(GET_ARTIFACTS_REQUEST);
const getArtifactsSuccess = makeActionCreator(GET_ARTIFACTS_SUCCESS, 'list');
const getArtifactsFailure = makeActionCreator(GET_ARTIFACTS_FAILURE, 'error');

export const getArtifacts = () => (
  (dispatch, getState) => {
    dispatch(getArtifactsRequest());

    // Get current user from state (but catch any errors)
    try {
      const {user: {currentUser: {uid}}} = getState();
      if (!uid) {
        dispatch(getArtifactsFailure('No user'));
      }

      // Get reference
      const reference = firebase.database().ref('artifacts').orderByChild('user').equalTo(uid);

      // Then listen for changes (this does fire initially)
      reference.on('value', (snapshot) => {
        dispatch(getArtifactsSuccess(snapshot.val()));
      });
    } catch (error) {
      dispatch(getArtifactsFailure(error));
    }
  }
);

const createArtifactRequest = makeActionCreator(CREATE_ARTIFACT_REQUEST, 'key');
const createArtifactSuccess = makeActionCreator(CREATE_ARTIFACT_SUCCESS);
const createArtifactFailure = makeActionCreator(CREATE_ARTIFACT_FAILURE, 'error');

export const createArtifact = (key) => (
  (dispatch, getState) => {
    /**
     * We initially create the record because its much faster and the item will appear in the UI quicker.
     * From then we can pass the rest through to the cloud function to create the export and update
     * the record
     */

    // Notify the user that something is happening
    dispatch(createArtifactRequest(key));

    const {
      configurations: {
        configurationList
      }
    } = getState();

    const {
      user,
    } = configurationList[key];

    const artifactKey = [key, '_', moment().format('HHmmssDDMMYYYY')].join('');

    const record = {
      key: artifactKey,
      status: 'pending',
      user,
      configuration: key,
    };

    const referencePath = `artifacts/${artifactKey}`;
    const reference = firebase.database().ref(referencePath);

    reference.set(record)
      // Get a JWT token to auth us
      .then(() => firebase.auth().currentUser.getIdToken(true))
      // Trigger the HTTP function
      .then((token) => (
        fetch('http://localhost:5001/bloodmagic-ff7cb/us-central1/createExport', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token,
            configuration: key,
            artifactKey,
          }),
        })
      ))
      // Catch a response error (we'll send back 500 if the function fails)
      .then((response) => {
        if (!(response.status >= 200 && response.status < 300)) {
          var error = new Error(response.statusText)
          error.response = response
          throw error
        }
      })
      // Whatever happens, we are no longer fetching
      .then(() => dispatch(createArtifactSuccess()))
      .catch((error) => dispatch(createArtifactFailure(error)));

  }
);

const deleteArtifactRequest = makeActionCreator(DELETE_ARTIFACT_REQUEST, 'key');
const deleteArtifactSuccess = makeActionCreator(DELETE_ARTIFACT_SUCCESS);
const deleteArtifactFailure = makeActionCreator(DELETE_ARTIFACT_FAILURE, 'error');

export const deleteArtifact = (key) => (
  (dispatch, getState) => {
    dispatch(deleteArtifactRequest(key));

    const {
      artifacts: {
        artifactList,
      },
      user: {
        uid,
      },
    } = getState();

    const artifact = artifactList[key];

    const databaseReferencePath = ['artifacts', key].join('/');
    const databasePromise = firebase.database().ref(databaseReferencePath).remove();

    const {
      metadata: {
        name
      }
    } = artifact;

    let storagePromise = Promise.resolve();
    if (name) {
      storagePromise = firebase.storage().ref().child(name).delete();
    }

    Promise.all([
      databasePromise,
      storagePromise,
    ]).then(() => {
      dispatch(deleteArtifactSuccess());
    }).catch((errors) => {
      dispatch(deleteArtifactSuccess(errors[0]));
    });
  }
);

/**
 * This is just here cause
 */
export const downloadArtifact = (key) => (
  (dispatch, getState) => {
    firebase.auth().currentUser.getIdToken(true)
      .then((token) => {
        window.location = `http://localhost:5001/bloodmagic-ff7cb/us-central1/downloadExport?token=${encodeURIComponent(token)}&artifact=${encodeURIComponent(key)}`;
      });
  }
);
