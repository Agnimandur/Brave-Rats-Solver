const Navbar = () => {
    return (
      <nav className="navbar">
        <h1>Brave Rats Solver</h1>
        <div className="links">
          <a href="/">Home</a>
          <a href="/create" style={{ 
            color: 'white', 
            backgroundColor: '#f1356d',
            borderRadius: '8px' 
          }}>Play Game</a>
        </div>
      </nav>
    );
  }
   
  export default Navbar;