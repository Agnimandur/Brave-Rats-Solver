import { useEffect, useState } from "react";
import axios from "axios";

import {State, yargImages, applewoodImages} from './state.js';
import {solve} from './nash.js';

const Home = () => {
    //Player 1
    const [blueCards, setblueCards] = useState([
        {name: 'Musician', image: yargImages[0], selected: true, id: 0},
        {name: 'Princess', image: yargImages[1], selected: true, id: 1},
        {name: 'Spy', image: yargImages[2], selected: true, id: 2},
        {name: 'Assassin', image: yargImages[3], selected: true, id: 3},
        {name: 'Ambassador', image: yargImages[4], selected: true, id: 4},
        {name: 'Wizard', image: yargImages[5], selected: true, id: 5},
        {name: 'General', image: yargImages[6], selected: true, id: 6},
        {name: 'Prince', image: yargImages[7], selected: true, id: 7},
    ]);

    //Player 2
    const [redCards, setredCards] = useState([
        {name: 'Musician', image: applewoodImages[0], selected: true, id: 0},
        {name: 'Princess', image: applewoodImages[1], selected: true, id: 1},
        {name: 'Spy', image: applewoodImages[2], selected: true, id: 2},
        {name: 'Assassin', image: applewoodImages[3], selected: true, id: 3},
        {name: 'Ambassador', image: applewoodImages[4], selected: true, id: 4},
        {name: 'Wizard', image: applewoodImages[5], selected: true, id: 5},
        {name: 'General', image: applewoodImages[6], selected: true, id: 6},
        {name: 'Prince', image: applewoodImages[7], selected: true, id: 7},
    ]);

    const [game,setGame] = useState(new State(0,0,0,0,0));
    function updateGame(k,v) {
        game[k]=v;
        setGame(game);
    }

    const [data, setData] = useState([]);

    const [strategy, setStrategy] = useState({ev: "No position entered", ans1: [0,0,0,0,0,0,0,0], ans2: [0,0,0,0,0,0,0,0]});

    useEffect(() => {
  
        axios.get("/braverats.json").then((res) => {
  
        setData(res.data);
      });
    }, []);

    const calculateStrategy = () => {
        let bit1 = 0;
        let bit2 = 0;
        for (var i = 0; i < 8; i++) {
            if (blueCards[i].selected === true) bit1 += (1<<i);
            if (redCards[i].selected === true) bit2 += (1<<i);
        }
        setStrategy(solve(bit1,bit2,game,data));
    }

    const checkboxClicked = (id, cards, setCards) => {
        let newCards = [];
        for (var i = 0; i < cards.length; i++) {
            if (cards[i].id !== id) {
                newCards.push(cards[i]);
            } else {
                newCards.push({name: cards[i].name, image: cards[i].image, selected: !cards[i].selected, id});
            }
        }
        setCards(newCards);
    }

    return (
      <div className="home">
        <div className="yarg">
            {blueCards.map((card) => (
                <div className="card-preview" key={card.id}>
                    <h3 className="title">{card.name}</h3>
                    <img src={card.image} alt={card.name}></img>
                    <input type="checkbox" onClick={() => checkboxClicked(card.id, blueCards, setblueCards)} defaultChecked></input>
                    <h4>{Math.round(100*strategy.ans1[card.id])}%</h4>
                </div>
            ))}
        </div>

        <div className="applewood">
            {redCards.map((card) => (
                <div className="card-preview" key={card.id}>
                    <h3 className="title">{card.name}</h3>
                    <img src={card.image} alt={card.name}></img>
                    <input type="checkbox" onClick={() => checkboxClicked(card.id, redCards, setredCards)} defaultChecked></input>
                    <h4>{Math.round(100*strategy.ans2[card.id])}%</h4>
                </div>
            ))}
        </div>
        
        <label for="yargScore" style={{color: 'blue'}}>Yarg Score: </label>
        <input id="yargScore" type="number" min="0" max="3" defaultValue="0" onChange={(e) => updateGame('score1',Number(e.target.value))}></input>
        <label for="holdScore">Points on Hold: </label>
        <input id="holdScore" type="number" min="0" max="7" defaultValue="0" onChange={(e) => updateGame('hold',Number(e.target.value))}></input>
        <label for="applewoodScore" style={{color: 'red'}}>Applewood Score: </label>
        <input id="applewoodScore" type="number" min="0" max="3" defaultValue="0" onChange={(e) => updateGame('score2',Number(e.target.value))}></input>

        <label for="spy">Spy? </label>
        <select id="spy" onChange={(e) => updateGame('spy',Number(e.target.value))}>
            <option value="0">No Spy</option>
            <option value="1">Yarg has spy</option>
            <option value="2">Applewood has spy</option>
        </select>

        <label for="general">General (+2)? </label>
        <select id="general" onChange={(e) => updateGame('general',Number(e.target.value))}>
            <option value="0">No General</option>
            <option value="1">Yarg has +2 this round</option>
            <option value="2">Applewood has +2 this round</option>
        </select>
        
        <br/>
        <br/>
        <div>
            <button className="solveButton" onClick={calculateStrategy}>SOLVE!</button>
        </div>
        <div>
            Yarg-Applewood Win %: {strategy.ev}
        </div>
      </div>
    );
  }
   
  export default Home;