import './App.css';
import Navbar from './NavBar';
import Solver from './Solver';

import { Route, Switch, Link } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="content">
        
        <Switch>
            <Route exact path="/">
              <Solver />
            </Route>
            <Route path="/game">
              <Game />
            </Route>
          </Switch>
      </div>
    </div>
  );
}

export default App;
