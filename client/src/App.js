import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";
import { Provider } from "react-redux";
//IMPORT STORE
import store from "./store";
//IMPORT CSS
import "./App.css";
//IMPORT COMPONENTS
import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import Footer from "./components/layout/Footer";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";

//CHECK FOR TOKEN
if (localStorage.jwtToken) {
  //SET AUTH TOKEN TO HEADER AUTH
  setAuthToken(localStorage.jwtToken);
  //DECODE TOKEN AND GET USER INFO AND EXP
  const decoded = jwt_decode(localStorage.jwtToken);
  //SET USER AND ISAUTHENTICATED
  store.dispatch(setCurrentUser(decoded));
  //CHECK FOR EXPIRED TOKEN
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    //LOGOUT USER IF EXPIRED
    store.dispatch(logoutUser());
    //CLEAR CURRENT PROFILE*******************
    //REDIRECT TO LOGIN ********************
    window.location.href = "/login";
  }
}

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Navbar />
            <Route exact path="/" component={Landing} />
            <div className="container">
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
            </div>
            <Footer />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
