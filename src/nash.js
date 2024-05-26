import {State} from './state.js';

/*
The resulting gamestate following a single trick.
*/
function round(card1, card2, general1, general2) {
    //0 = hold, positive = points for team1, negative = points for team2
    let results = [ 
        [0, 0, 0, 0, 0,-1, 0, 0],
        [0, 0,-1, 1,-2,-1,-1, 4],
        [0, 1, 0, 1,-2,-1,-1,-1],
        [0,-1,-1, 0, 1,-1, 1,-1],
        [0, 2, 2,-1, 0,-1,-1,-1],
        [1, 1, 1, 1, 1, 0,-1,-1],
        [0, 1, 1,-1, 1, 1, 0,-1],
        [0,-4, 1, 1, 1, 1, 1, 0]
    ];
    //matrix for general1 results
    let generalResults = [
        [0, 0, 0, 0, 0,-1, 0, 0],
        [0, 1, 1, 0,-2,-1,-1, 4],
        [0, 1, 1,-1, 0,-1,-1,-1],
        [0,-1,-1,-1,-2, 0, 1,-1],
        [0, 2, 2,-1, 2, 1, 0,-1],
        [1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1,-1, 1, 1, 1,-1],
        [0,-4, 1, 1, 1, 1, 1, 1]
    ];

    let score;
    if ((general1 ^ general2) === 0) score = results[card1][card2];
    else if (general1) score = generalResults[card1][card2];
    else score = -1 * generalResults[card2][card1];

    let score1 = score > 0 ? score : 0;
    let score2 = score < 0 ? -1 * score : 0;
    let hold = score === 0;
    let spy = 0;
    if (card1 === card2) spy = 0;
    else if (card1 === 2 && card2 !== 5) spy = 1;
    else if (card2 === 2 && card1 !== 5) spy = 2;
    let general = 0;
    if (card1 === card2) general = 0;
    else if (card1 === 6 && card2 !== 5) general = 1;
    else if (card2 === 6 && card1 !== 5) general = 2;

    let bit1 = (1 << card1);
    let bit2 = (1 << card2);

    return new State({bit1, bit2, score1, score2, hold, spy, general});
}

/*
Given a state, return a new state resulting from a specific trick played.
*/
export function playMove(cur, card1, card2) {
    let delta = round(card1,card2,cur.general===1,cur.general===2);

    let score1 = cur.score1 + delta.score1;
    if (delta.score1 > 0) score1 += cur.hold;
    let score2 = cur.score2 + delta.score2;
    if (delta.score2 > 0) score2 += cur.hold;
    let hold = delta.hold > 0 ? 1 + cur.hold : 0;
    
    return new State({bit1: cur.bit1 ^ delta.bit1, bit2: cur.bit2 ^ delta.bit2, score1: Math.min(4,score1), score2: Math.min(4,score2), hold: Math.min(4,hold),spy: delta.spy, general: delta.general});
}

//Compute the Nash Equilbrium with regret minimization
function getStrategy(regret) {
    let c = regret.length;
    let strategy = Array.from({length: c}).fill(0.0);
    let s = 0.0;
    for (let i = 0; i < c; i++) {
        strategy[i] = Math.max(0.0,regret[i]);
        s += strategy[i];
    }

    if (s > 1e-5) {
        for (let i = 0; i < c; i++) strategy[i] /= s;
    } else {
        for (let i = 0; i < c; i++) strategy[i] = 1.0/c;
    }
    return strategy;
}

function calculateOutcome(cur, data) {
    let cards1 = [];
    let cards2 = [];
    for (let i = 0; i < 8; i++) {
        if (cur.inHand("yarg",i)) cards1.push(i);
        if (cur.inHand("applewood",i)) cards2.push(i);
    }
    let c = cards1.length;
    let outcome = Array.from({length: c});
    for (let i = 0; i < c; i++) {
        outcome[i] = Array.from({length: c}).fill(0.0);
    }
    for (let i = 0; i < c; i++) {
        for (let j = 0; j < c; j++) {
            let res = playMove(cur,cards1[i],cards2[j]);
            if (res.score1 === 4) outcome[i][j] = 1.0; //player 1 wins
            else if (res.score2 === 4) outcome[i][j] = -1.0; //player 2 wins
            else {
                let hash = res.getHash();
                if (hash in data) {
                    outcome[i][j] = data[hash];
                } else {
                    outcome[i][j] = 0.0; //dummy case.
                }
            }
        }
    }
    return outcome;
}

function nash(cur,iters, data) {
    let outcome = calculateOutcome(cur, data);
    let c = outcome.length;

    let sum1 = Array.from({length: c}).fill(0.0);
    let sum2 = Array.from({length: c}).fill(0.0);
    let regret1 = Array.from({length: c}).fill(0.0);
    let regret2 = Array.from({length: c}).fill(0.0);

    for (let iter = 0; iter < iters; iter++) {
        let s1 = getStrategy(regret1);
        let s2 = getStrategy(regret2);
        for (let i = 0; i < c; i++) {
            sum1[i] += s1[i];
            sum2[i] += s2[i];
        }

        for (let a1 = 0; a1 < c; a1++) {
            for (let a2 = 0; a2 < c; a2++) {
                for (let a = 0; a < c; a++) {
                    regret1[a] += (outcome[a][a2] - outcome[a1][a2]) * (s1[a1] * s2[a2]);
                    regret2[a] -= (outcome[a1][a] - outcome[a1][a2]) * (s1[a1] * s2[a2]);
                }
            }
        }
    }

    let cards1 = [];
    let cards2 = [];
    for (let i = 0; i < 8; i++) {
        if (cur.inHand("yarg",i)) cards1.push(i);
        if (cur.inHand("applewood",i)) cards2.push(i);
    }
    let ans1 = Array.from({length: 8});
    let ans2 = Array.from({length: 8});
    for (let i = 0; i < c; i++) {
        ans1[cards1[i]] = sum1[i]/iters;
        ans2[cards2[i]] = sum2[i]/iters;
    }
    return {ans1,ans2};
}

export function minmax(cur, data) {
    let cards1 = [];
    let cards2 = [];
    for (let i = 0; i < 8; i++) {
        if (cur.inHand("yarg",i)) cards1.push(i);
        if (cur.inHand("applewood",i)) cards2.push(i);
    }
    let outcome = calculateOutcome(cur, data);
    let c = outcome.length;
    let ansPair;
    let INF = 100.0;
    if (cur.spy === 1) {
        let ans = INF;
        for (let j = 0; j < c; j++) {
            let val = -INF;
            let valPair;
            for (let i = 0; i < c; i++) {
                if (outcome[i][j] > val) {
                    val = outcome[i][j];
                    valPair = [i,j];
                }
            }
            if (val < ans) {
                ans = val;
                ansPair = valPair;
            }
        }
    } else {
        let ans = -INF;
        for (let i = 0; i < c; i++) {
            let val = INF;
            let valPair;
            for (let j = 0; j < c; j++) {
                if (outcome[i][j] < val) {
                    val = outcome[i][j];
                    valPair = [i,j];
                }
            }
            if (val > ans) {
                ans = val;
                ansPair = valPair;
            }
        }
    }
    let ans1 = Array.from({length: 8});
    let ans2 = Array.from({length: 8});
    for (let x of cards1) ans1[x] = 0.0;
    for (let x of cards2) ans2[x] = 0.0;
    ans1[cards1[ansPair[0]]] = 1.0;
    ans2[cards2[ansPair[1]]] = 1.0;
    return {ans1,ans2};
}

export function solve(cur, data, iters=2000) {
    let hash = cur.getHash();
    let result;
    if (hash in data) {
        let ev = String(Math.round(50+50*data[hash])) + "-" + String(Math.round(50-50*data[hash]));
        if (cur.spy === 1 || cur.spy === 2) {
            //someone has spy
            result = minmax(cur,data);
        } else {
            result = nash(cur,iters,data);
        }
        result.ev = ev;
        return result;
    } else {
        var ev = "Invalid Brave Rats position";
        return {ev, ans1: [0,0,0,0,0,0,0,0], ans2: [0,0,0,0,0,0,0,0]};
    }
}