import React from 'react';
import {useRef} from 'react';
import { State, fetchCard, fetchImage } from './state.js';

function checkboxClicked(name, id, game, setGame) {
    if (name === "yarg")
        setGame(new State({...game, bit1: game.bit1 ^ (1 << id)}));
    else
        setGame(new State({...game, bit2: game.bit2 ^ (1 << id)}));
}

function cardClicked(card, selected, setSelected) {
    if (selected === card) {
        setSelected(-1);
    } else {
        setSelected(card);
    }
}

/* props
name: name of faction ("yarg" or "applewood")
game: the game state (Solver state)
setGame modify the game state (Solver state)
strategyArray: GTO strategy of faction (Solver state)

selected: card selected (Game state)
setSelected: modify the selected card (Game state)
*/
const Hand = (props) => {
    const windowWidth = useRef(window.innerWidth);
    let cards = [];
    for (let i = 0; i < 8; i++) {
        if (props.selected=== undefined || props.game.inHand(props.name,i)) cards.push(fetchCard(props.name,i));
    }

    return (
        <div className={props.name}>
            {cards.map((card) => (
                <div className={props.selected !== card.id ? "card-preview" : "card-preview clicked"} key={card.id} onClick={() => props.selected!== undefined && cardClicked(card.id,props.selected,props.setSelected)}>
                    <h4 className="title">{card.name}</h4>
                    {windowWidth.current > 700 && <img src={fetchImage(props.name,card.id)} alt={card.name}></img>}
                    {props.selected===undefined && <React.Fragment>
                        <input type="checkbox" onClick={() => checkboxClicked(props.name,card.id,props.game,props.setGame)} defaultChecked></input>
                        <h5>{Math.round(100*props.strategyArray[card.id])}%</h5>
                    </React.Fragment>}
                </div>
            ))}
        </div>
    );
}

export default Hand;