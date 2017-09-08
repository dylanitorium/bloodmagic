import * as firebase from 'firebase';
import { push } from 'react-router-redux';

import { makeActionCreator } from '../utils';

import {
  AUTH_USER_REQUEST,
  AUTH_USER_SUCCESS,
  AUTH_USER_FAILURE,

  UNAUTH_USER_REQUEST,
  UNAUTH_USER_SUCCESS,
  UNAUTH_USER_FAILURE,

  GET_EXTRA_DATA_REQUEST,
  GET_EXTRA_DATA_SUCCESS,
  GET_EXTRA_DATA_FAILURE
} from './constants';


const providers = {
  google: () => {
    return new firebase.auth.GoogleAuthProvider();
  },
  github: () => {
    return new firebase.auth.GithubAuthProvider();
  },
};

const authenticateUserRequest = makeActionCreator(AUTH_USER_REQUEST, 'provider');
const authenticateUserSuccess = makeActionCreator(AUTH_USER_SUCCESS, 'user', 'token');
const authenticateUserFailure = makeActionCreator(AUTH_USER_FAILURE, 'error');

export const authenticateUser = provider => (
  (dispatch) => {
      dispatch(authenticateUserRequest(provider));
      firebase.auth()
        .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
          firebase.auth()
            .signInWithPopup(providers[provider]())
            .then((result) => {
              const user = result.user;
              dispatch(authenticateUserSuccess(user));
              dispatch(push('/'));
            })
        })
        .catch((error) => {
          dispatch(authenticateUserFailure(error));
        });
  }
);

const endAuthenticationRequest = makeActionCreator(UNAUTH_USER_REQUEST);
const endAuthenticationSuccess = makeActionCreator(UNAUTH_USER_SUCCESS);
const endAuthenticationFailure = makeActionCreator(UNAUTH_USER_FAILURE, 'error');

export const endAuthentication = () => (
  (dispatch) => {
    dispatch(endAuthenticationRequest());
    firebase.auth()
      .signOut()
      .then(() => {
        dispatch(endAuthenticationSuccess());
        dispatch(push('/login'));
      })
      .catch((error) => {
        dispatch(endAuthenticationFailure(error));
      })
  }
);

const getExtraDataRequest = makeActionCreator(GET_EXTRA_DATA_REQUEST);
const getExtraDataSuccess = makeActionCreator(GET_EXTRA_DATA_SUCCESS, 'data');
const getExtraDataFailure = makeActionCreator(GET_EXTRA_DATA_FAILURE, 'error');

export const getExtraData = () => (
  (dispatch, getState) => {
    dispatch(getExtraDataRequest);

    // Get current user from state (but catch any errors)
    try {
      const {user: {currentUser: {uid}}} = getState();
      if (!uid) {
        dispatch(getExtraDataFailure('No user'));
      }

      // Get reference
      const reference = firebase.database().ref(`users/${uid}`);

      // Then listen for changes (this does fire initially)
      reference.on('value', (snapshot) => {
        dispatch(getExtraDataSuccess(snapshot.val()));
      });
    } catch (error) {
      dispatch(getExtraDataFailure(error));
    }
  }
);


