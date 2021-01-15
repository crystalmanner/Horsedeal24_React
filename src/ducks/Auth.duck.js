import isEmpty from 'lodash/isEmpty';
import { clearCurrentUser, fetchCurrentUser } from './user.duck';
import { storableError } from '../util/errors';
import * as log from '../util/log';

const authenticated = authInfo => authInfo && authInfo.grantType === 'refresh_token';

// ================ Action types ================ //

export const AUTH_INFO_REQUEST = 'app/Auth/AUTH_INFO_REQUEST';
export const AUTH_INFO_SUCCESS = 'app/Auth/AUTH_INFO_SUCCESS';

export const LOGIN_REQUEST = 'app/Auth/LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'app/Auth/LOGIN_SUCCESS';
export const LOGIN_ERROR = 'app/Auth/LOGIN_ERROR';

export const LOGOUT_REQUEST = 'app/Auth/LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'app/Auth/LOGOUT_SUCCESS';
export const LOGOUT_ERROR = 'app/Auth/LOGOUT_ERROR';

export const SIGNUP_REQUEST = 'app/Auth/SIGNUP_REQUEST';
export const SIGNUP_SUCCESS = 'app/Auth/SIGNUP_SUCCESS';
export const SIGNUP_ERROR = 'app/Auth/SIGNUP_ERROR';

// Generic user_logout action that can be handled elsewhere
// E.g. src/reducers.js clears store as a consequence
export const USER_LOGOUT = 'app/USER_LOGOUT';

// ================ Reducer ================ //

const initialState = {
  isAuthenticated: false,

  // auth info
  authInfoLoaded: false,

  // login
  loginError: null,
  loginInProgress: false,

  // logout
  logoutError: null,
  logoutInProgress: false,

  // signup
  signupError: null,
  signupInProgress: false,
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case AUTH_INFO_REQUEST:
      return state;
    case AUTH_INFO_SUCCESS:
      return { ...state, authInfoLoaded: true, isAuthenticated: authenticated(payload) };

    case LOGIN_REQUEST:
      return {
        ...state,
        loginInProgress: true,
        loginError: null,
        logoutError: null,
        signupError: null,
      };
    case LOGIN_SUCCESS:
      return { ...state, loginInProgress: false, isAuthenticated: true };
    case LOGIN_ERROR:
      return { ...state, loginInProgress: false, loginError: payload };

    case LOGOUT_REQUEST:
      return { ...state, logoutInProgress: true, loginError: null, logoutError: null };
    case LOGOUT_SUCCESS:
      return { ...state, logoutInProgress: false, isAuthenticated: false };
    case LOGOUT_ERROR:
      return { ...state, logoutInProgress: false, logoutError: payload };

    case SIGNUP_REQUEST:
      return { ...state, signupInProgress: true, loginError: null, signupError: null };
    case SIGNUP_SUCCESS:
      return { ...state, signupInProgress: false };
    case SIGNUP_ERROR:
      return { ...state, signupInProgress: false, signupError: payload };

    default:
      return state;
  }
}

// ================ Selectors ================ //

export const authenticationInProgress = state => {
  const { loginInProgress, logoutInProgress, signupInProgress } = state.Auth;
  return loginInProgress || logoutInProgress || signupInProgress;
};

// ================ Action creators ================ //

export const authInfoRequest = () => ({ type: AUTH_INFO_REQUEST });
export const authInfoSuccess = info => ({ type: AUTH_INFO_SUCCESS, payload: info });

export const loginRequest = () => ({ type: LOGIN_REQUEST });
export const loginSuccess = () => ({ type: LOGIN_SUCCESS });
export const loginError = error => ({ type: LOGIN_ERROR, payload: error, error: true });

export const logoutRequest = () => ({ type: LOGOUT_REQUEST });
export const logoutSuccess = () => ({ type: LOGOUT_SUCCESS });
export const logoutError = error => ({ type: LOGOUT_ERROR, payload: error, error: true });

export const signupRequest = () => ({ type: SIGNUP_REQUEST });
export const signupSuccess = () => ({ type: SIGNUP_SUCCESS });
export const signupError = error => ({ type: SIGNUP_ERROR, payload: error, error: true });

export const userLogout = () => ({ type: USER_LOGOUT });

// ================ Thunks ================ //

export const authInfo = () => (dispatch, getState, sdk) => {
  dispatch(authInfoRequest());
   return sdk
    .authInfo()
    .then(info => dispatch(authInfoSuccess(info)))
    .catch(e => {
      // Requesting auth info just reads the token from the token
      // store (i.e. cookies), and should not fail in normal
      // circumstances. If it fails, it's due to a programming
      // error. In that case we mark the operation done and dispatch
      // `null` success action that marks the user as unauthenticated.
      log.error(e, 'auth-info-failed');
      dispatch(authInfoSuccess(null));
    });
};


export const loginFacebook = (data) => (dispatch, getState, sdk) => {
  if (authenticationInProgress(getState())) {
      return Promise.reject(new Error('Login or logout already in progress'));
    } else {
          const username = data['email']
          const password = data['id']
          const additionalData = { 'FBPicture' : password }
          return sdk
            .login({ username, password })
            .then(() => dispatch(loginSuccess()))
            .then(() => dispatch(fetchCurrentUser(null, additionalData)))
            .catch(e => dispatch(loginError(storableError(e))));
  }
}

 export const login = (username, password, FBLogin) => (dispatch, getState, sdk) => {
  if (authenticationInProgress(getState())) {
    return Promise.reject(new Error('Login or logout already in progress'));
  }
  dispatch(loginRequest());
  const FBdata = FBLogin ? { 'FBPicture' : password } : null
  // Note that the thunk does not reject when the login fails, it
  // just dispatches the login error action.
  return sdk
    .login({ username, password })
    .then(() => dispatch(loginSuccess()))
    .then(() => dispatch(fetchCurrentUser(null, FBdata)))
    .catch(e => dispatch(loginError(storableError(e))));
};

export const logout = () => (dispatch, getState, sdk) => {
  if (authenticationInProgress(getState())) {
    return Promise.reject(new Error('Login or logout already in progress'));
  }
  dispatch(logoutRequest());

  // Note that the thunk does not reject when the logout fails, it
  // just dispatches the logout error action.
  return sdk
    .logout()
    .then(() => {
      // The order of the dispatched actions
      dispatch(logoutSuccess());
      dispatch(clearCurrentUser());
      log.clearUserId();
      dispatch(userLogout());
    })
    .catch(e => dispatch(logoutError(storableError(e))));
};

export const signup = params => (dispatch, getState, sdk) => {
  if (authenticationInProgress(getState())) {
    return Promise.reject(new Error('Login or logout already in progress'));
  }

  dispatch(signupRequest());
  const { email, password, firstName, lastName, ...rest } = params;

  let createUserParams = isEmpty(rest)
    ? { email, password, firstName, lastName }
    : { email, password, firstName, lastName, protectedData: { ...rest } };

  // We must login the user if signup succeeds since the API doesn't
  // do that automatically.
  return sdk.currentUser
    .create(createUserParams)
    .then(() => dispatch(signupSuccess()))
    .then(() => dispatch(login(email, password)))
    .catch(e => {
      dispatch(signupError(storableError(e)));
      log.error(e, 'signup-failed', {
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
      });
    });
};


export const singupFacebook = data => (dispatch, getState, sdk) => {
  if (authenticationInProgress(getState())) {
    return Promise.reject(new Error('Login or logout already in progress'));
  }
  dispatch(signupRequest())

    const email = data.email
    const firstName = data.name.split(' ')[0]
    const lastName = data.name.split(' ')[1]
    const password = data.id
    
    const createUserParams = {
      'email': email,
      'password': password,
      'firstName': firstName,
      'lastName': lastName,
    }
    //const changeEmail = {'newEmail': email, 'currentPassword': password }
    //const changePassword= {'newPassword': password, 'currentPassword': password }
    // We must login the user if signup succeeds since the API doesn't
    // do that automatically.

    return sdk.currentUser
      .create(createUserParams)
      .then(() => dispatch(signupSuccess()))
      .then(() => dispatch(login(email, password, true)))
      .catch(e => {
        dispatch(signupError(storableError(e)));
        log.error(e, 'signup-failed', {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        });
      });
};

