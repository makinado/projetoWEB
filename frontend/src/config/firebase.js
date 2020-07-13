import Vue from 'vue'
import * as firebase from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDu861Jo7gYWl0FMUjPnZ5Cu_0219Yw218",
  authDomain: "sistemaonline-eadd6.firebaseapp.com",
  databaseURL: "https://sistemaonline-eadd6.firebaseio.com",
  projectId: "sistemaonline-eadd6",
  storageBucket: "sistemaonline-eadd6.appspot.com"
};

firebase.initializeApp(firebaseConfig);