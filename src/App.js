import './App.css';
import Navbar from './NavBar';
import Solver from './Solver';

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
