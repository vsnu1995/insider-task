import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Upload } from "./Upload";

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <nav className="navbar navbar-expand navbar-dark bg-dark">
            <div className="collapse navbar-collapse" id="navbarsExample02">
              <ul className="navbar-nav mr-auto col-md-12">
                <li className="nav-item col-md-3">
                  <Link to="/upload" >Upload</Link>
                </li>
              </ul>
            </div>
          </nav>
          <Route path="/upload" component={Upload} />
        </div>
      </Router>
    );
  }
}

export default App;
