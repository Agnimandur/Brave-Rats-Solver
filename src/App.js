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
        
        <Routes>
            <Route path='/' element={<Solver/>} />
            <Route path='/game' element={<Game/>} />
          </Routes>
      </div>
    </div>
  );
}

export default App;
