import './App.css';
import Navbar from './NavBar';
import Solver from './Solver';
import Game from './Game';

import { Routes , Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="content">
        <Solver />
      </div>
    </div>
  );
}

export default App;
