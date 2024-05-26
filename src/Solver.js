import { useEffect, useState } from "react";
import axios from "axios";

import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';

import {State} from './state.js';
import {solve} from './nash.js';

import Hand from './Hand.js';

const Solver = () => {
  const newGamestate = new State({bit1: 255, bit2: 255, score1: 0, score2: 0,hold: 0, spy: 0, general: 0});
  const newStrategy = {ev: "No position solved", ans1: [0,0,0,0,0,0,0,0], ans2: [0,0,0,0,0,0,0,0]};
  const [game,setGame] = useState(newGamestate);

  const [data, setData] = useState([]);

  const [strategy, setStrategy] = useState(newStrategy);

  function resetGame() {
    setGame(newGamestate);
    setStrategy(newStrategy);
  }

  useEffect(() => {
      axios.get("/braverats.json").then((res) => {

      setData(res.data);
    });
  }, []);

  function calculateStrategy() {
    setStrategy(solve(game,data));
  }

  return (
    <div className="home">
      <Hand name="yarg" game={game} setGame={setGame} strategyArray={strategy.ans1} />
      <Hand name="applewood" game={game} setGame={setGame} strategyArray={strategy.ans2} />

      <Stack className="centeredRow" direction="horizontal" gap={2}>
        <label htmlFor="yargScore" style={{color: 'blue'}}>Yarg Score: </label>
        <input id="yargScore" type="number" min="0" max="3" defaultValue="0" onChange={(e) => setGame(new State({...game, score1: Number(e.target.value)}))}></input>
        
        <label htmlFor="holdScore">Points on Hold: </label>
        <input id="holdScore" type="number" min="0" max="7" defaultValue="0" onChange={(e) => setGame(new State({...game, hold: Number(e.target.value)}))}></input>
        
        <label htmlFor="applewoodScore" style={{color: 'red'}}>Applewood Score: </label>
        <input id="applewoodScore" type="number" min="0" max="3" defaultValue="0" onChange={(e) => setGame(new State({...game, score2: Number(e.target.value)}))}></input>

        <label htmlFor="spy">Spy? </label>
        <select id="spy" onChange={(e) => setGame(new State({...game, spy: Number(e.target.value)}))}>
            <option value="0">No Spy</option>
            <option value="1">Yarg has spy</option>
            <option value="2">Applewood has spy</option>
        </select>

        <label htmlFor="general">General (+2)? </label>
        <select id="general" onChange={(e) => setGame(new State({...game, general: Number(e.target.value)}))}>
            <option value="0">No General</option>
            <option value="1">Yarg has +2 this round</option>
            <option value="2">Applewood has +2 this round</option>
        </select>
      </Stack>
      
      <Stack className="centeredRow" direction="horizontal" gap={2}>
          <Button variant="danger" size="lg" onClick={calculateStrategy}>SOLVE!</Button>
          <h5>Yarg-Applewood Win %: {strategy.ev}</h5>
          {strategy.ev.length <= 5 && <ProgressBar style={{width: 200}} now={strategy.ev.split('-')[0]} />}
          <Button variant="secondary" onClick={resetGame}>Reset</Button>
      </Stack>
      
    </div>
  );
}
   
  export default Solver;