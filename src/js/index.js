import init from './view';
import * as firebase from 'firebase';
import config from './config';

const { FIREBASE } = config;

firebase.initializeApp(FIREBASE);

init();
