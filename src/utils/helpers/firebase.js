import firebase, { initializeApp } from "firebase/app";

const config = {
  apiKey: "AIzaSyAFsqkQCx_7CYScQPSk21vYJ_j2vJYGz7Y",

  authDomain: "echo-location-618f9.firebaseapp.com",

  projectId: "echo-location-618f9",

  storageBucket: "echo-location-618f9.appspot.com",

  messagingSenderId: "1050387450921",

  appId: "1:1050387450921:web:2989826bc4be4e0d84e038",
};

try {
  initializeApp(config);
} catch (err) {
  if (!/already exists/.test(err.message)) {
    console.error("Firebase initialization error", err.stack);
  }
}

const fire = firebase;
export default fire;
