import { GET_ERRORS, SET_CURRENT_USER } from "./types";
import axios from "axios";
import setAuthToken from "./../utils/setAuthToken";
import jwt_decode from "jwt-decode";

//REGISTER USER
export const registerUser = (userData, history) => dispatch => {
  axios
    .post("/api/users/register", userData)
    .then(res => {
      history.push("/login");
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

//Login - Get User Token
export const loginUser = userData => dispatch => {
  axios
    .post("/api/users/login", userData)
    .then(res => {
      //Save to localStorage
      const { token } = res.data;
      //Set token to LS
      localStorage.setItem("jwtToken", token);
      //Set token to Auth header
      setAuthToken(token);
      //DECODE token to get user data
      const decoded = jwt_decode(token);
      //SET CURRENT USER
      dispatch(setCurrentUser(decoded));
    })
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      });
    });
};

//SET LOGGED IN USER
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};

//LOG USER OUT
export const logoutUser = () => dispatch => {
  //REMOVE THE TOKEN FROM LOCAL STORAGE
  localStorage.removeItem("jwtToken");
  //REMOVE AUTH HEADER FOR FUTURE REQUESTS
  setAuthToken(false);
  //SET CURRENT USER TO {} WHICH WILL ALSO SET ISAUTHENTICATED TO FALSE
  dispatch(setCurrentUser({}));
};
