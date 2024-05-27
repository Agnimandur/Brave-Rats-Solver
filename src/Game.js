import Navbar from './NavBar';
import axios from "axios";
import { useEffect, useState, React } from "react";

import Form from 'react-bootstrap/Form';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';


import {solve, playMove, minmax} from './nash.js';

import {State, fetchImage} from './state.js';
import Hand from './Hand.js';

const Game = () => {
    const newGamestate = new State({bit1: 255, bit2: 255, score1: 0, score2: 0,hold: 0, spy: 0, general: 0});
    const newGameSettings = {name: '0', difficulty: '0', begun: false};
    const [game,setGame] = useState(newGamestate);
  
    const [data, setData] = useState([]);

    const [selected,setSelected] = useState(-1);
  
    useEffect(() => {
        axios.get("/braverats.json").then((res) => {
  
        setData(res.data);
      });
    }, []);

    const [settings,setSettings] = useState(newGameSettings);

    function handleBeginGame(e) {
        e.preventDefault();
        setSettings({...settings, begun: true});
    };

    const [history, setHistory] = useState("History:\n");

    function forcedBySpy() {
        let {ans1,ans2} = minmax(game,data);
        let gto = settings.name === "yarg" ? ans2 : ans1;
        for (let i = 0; i < 8; i++) {
            if (gto[i] !== undefined && gto[i] > 0.5) return i;
        }
    }

    function handlePlay() {
        let cpuMove;
        if (game.hasSpy(settings.name)) {
            //player has the spy!
            cpuMove = forcedBySpy();
        } else {
            let iters = Math.pow(5,Number(settings.difficulty)-1)*2;
            let {ev,ans1,ans2} = solve(game,data,iters);

            let gto = settings.name === "yarg" ? ans2 : ans1;

            let rand = Math.random();
            for (let i = 0; i < 8; i++) {
                if (gto[i]) rand -= gto[i];
                if (rand < 0) {
                    cpuMove = i;
                    break;
                }
            }
            console.log(ev);
        }

        let oldDiff = game.score1 - game.score2;
        let result;
        let newGame;
        if (settings.name === "yarg") {
            newGame = playMove(game,selected,cpuMove);
            let newDiff = newGame.score1 - newGame.score2;
            result = newDiff - oldDiff;
        } else {
            newGame = playMove(game,cpuMove,selected);
            let newDiff = newGame.score1 - newGame.score2;
            result = oldDiff - newDiff;
        }
        let resultString;
        if (result > 0) resultString = `Player gained ${result}`;
        else if (result < 0) resultString = `Computer gained ${-result}`;
        else resultString = "Round put on hold";

        let spyString = "";
        if (newGame.hasSpy(settings.name)) spyString = "Computer must reveal card in next round\n";
        else if (newGame.spy !== 0) spyString = "Player must reveal card in next round\n";
        let generalString = "";
        if (newGame.hasGeneral(settings.name)) generalString = "Player gets +2 next round\n";
        else if (newGame.general !== 0) generalString = "Computer gets +2 next round\n";
        
        setGame(newGame);
        setHistory(history + `Player played ${selected}\nComputer played ${cpuMove}\n${resultString}\n${spyString}${generalString}\n`);
        setSelected(-1);
    }

    function resetGame() {
        setGame(newGamestate);
        setSelected(-1);
        setSettings(newGameSettings);
    }

    if (game.score1 >= 4 || game.score2 >= 4 || game.bit1 === 0) {
        let endText;
        if (game.score1 === game.score2) {
            endText = "The game ended in a draw.";
        } else if ((game.score1 > game.score2 && settings.name === "yarg") || (game.score2 > game.score1 && settings.name === "applewood")) {
            endText = `Congratulations, you defeated the computer on difficulty ${settings.difficulty}!`;
        } else {
            endText = "The computer won! :(";
        }
        return (
            <div className="App">
                <Navbar />
                <div
                    className="modal show"
                    style={{ display: 'block', position: 'initial' }}
                >
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.Title>Game Over</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>{endText}</p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="primary" onClick={resetGame}>Play again</Button>
                    </Modal.Footer>
                </Modal.Dialog>
                </div>
                <Stack className="gameRow" direction="horizontal" gap={3}>
                    <textarea className="form-control" value={history} rows="8" aria-label="readonly input example" style={{width: 400}} readOnly/>
                    <div>Player Score: <h1>{settings.name === "yarg" ? game.score1 : game.score2}</h1></div>
                    <div>Computer Score: <h1>{settings.name === "yarg" ? game.score2 : game.score1}</h1></div>
                </Stack>
            </div>
        )
    } else if (settings.begun) {
        return (
            <div className="App">
                <Navbar />
                <Hand name={settings.name} game={game} setGame={setGame} selected={selected} setSelected={setSelected}/>
                <Button variant="primary" size="lg" disabled={selected === -1} onClick={handlePlay}>Play</Button>
                
                <Stack className="gameRow" direction="horizontal" gap={3}>
                    <textarea className="form-control" value={history} rows="8" aria-label="readonly input example" style={{width: 300}} readOnly/>
                    <div>Player Score: <h1>{settings.name === "yarg" ? game.score1 : game.score2}</h1></div>
                    <div>Held Points: <h1>{game.hold}</h1></div>
                    <div>Computer Score: <h1>{settings.name === "yarg" ? game.score2 : game.score1}</h1></div>

                    {game.spy !== 0 && 
                        <figure>
                            <img alt="revealed by spy" src={game.hasSpy(settings.name) ? fetchImage(settings.name === "applewood" ? "yarg" : "applewood",forcedBySpy()) : fetchImage(settings.name,selected)} />
                            <figcaption>{game.hasSpy(settings.name) ? "Revealed by your spy" : "Revealed by computer spy"}</figcaption>
                        </figure>}
                </Stack>
            </div>
        );
    } else {
        return (
            <div className="App">
                <Navbar />
                <Form onSubmit={handleBeginGame}>
                    <Stack gap={2} className="col-md-5 mx-auto">
                        <Form.Select required aria-label="Default select example" onChange={(e) => setSettings({...settings, name:e.target.value})}>
                            <option value="0">Choose your faction</option>
                            <option value="yarg">Yarg</option>
                            <option value="applewood">Applewood</option>
                        </Form.Select>
                        {settings.name !== '0' && <img width={120} height={169} src={fetchImage(settings.name,7)} alt={"the " + settings.name + " team"}></img>}
                        
                        <br/>
    
                        <Form.Select aria-label="Default select example" onChange={(e) => setSettings({...settings, difficulty: e.target.value})}>
                            <option value="0">Computer Difficulty</option>
                            <option value="1">Easy</option>
                            <option value="2">Medium</option>
                            <option value="3">Hard</option>
                        </Form.Select>
    
                        <br/>
    
                        <Button type="submit" disabled={settings.name === '0' || settings.difficulty === '0'}>Begin</Button>
                    </Stack>
                </Form>
            </div>
        );
    }
}

export default Game;