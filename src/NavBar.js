const Navbar = () => {
    return (
      <nav className="navbar">
        <h1><a href="/">Brave Rats App</a></h1>
        <div className="links">
          <a href="https://recursivedragon.com">RDC</a>
          <a href="/game" style={{ 
            color: 'white', 
            backgroundColor: '#f1356d',
            borderRadius: '8px' 
          }}>Play Game</a>
        </div>
      </nav>
    );
  }
   
  export default Navbar;