import musician1 from './images/musician1.png';
import princess1 from './images/princess1.png';
import spy1 from './images/spy1.png';
import assassin1 from './images/assassin1.png';
import ambassador1 from './images/ambassador1.png';
import wizard1 from './images/wizard1.png';
import general1 from './images/general1.png';
import prince1 from './images/prince1.png';

import musician2 from './images/musician2.png';
import princess2 from './images/princess2.png';
import spy2 from './images/spy2.png';
import assassin2 from './images/assassin2.png';
import ambassador2 from './images/ambassador2.png';
import wizard2 from './images/wizard2.png';
import general2 from './images/general2.png';
import prince2 from './images/prince2.png';

import cover from './images/cover.png';

export class State {
    constructor({bit1, bit2, score1, score2, hold, spy, general}) {
      this.bit1 = bit1; //bitmask of Yarg hand
      this.bit2 = bit2; //bitmask of Applewood hand
      this.score1 = score1; // the current score of the Yargs
      this.score2 = score2; // the current score of the Applewoods
      this.hold = hold; // the number of points on hold
      this.spy = spy; // 0 = no spy, 1 = player1 has the spy benefit next round, 2 = player2 has the spy benefit next round
      this.general = general; // 0 = no general, 1 = player1 has general benefit next round, 2 = player2 has the general benefit next round
    }

    getHash() {
      return String(this.bit1).padStart(3,"0") + String(this.bit2).padStart(3,"0") + this.score1 + this.score2 + Math.min(4,this.hold) + this.spy + this.general;
    }

    inHand(name, id) {
      if (name === "yarg") return (this.bit1 & (1 << id));
      else if (name === "applewood") return (this.bit2 & (1 << id));
      else alert("error!");
    }

    hasSpy(name) {
      return (name === "yarg" && this.spy === 1) || (name === "applewood" && this.spy === 2);
    }

    hasGeneral(name) {
      return (name === "yarg" && this.general === 1) || (name === "applewood" && this.general === 2);
    }
};

export let yargImages = [musician1,princess1,spy1,assassin1,ambassador1,wizard1,general1,prince1];
export let applewoodImages = [musician2,princess2,spy2,assassin2,ambassador2,wizard2,general2,prince2];
export let yargCards = [
  {name: 'Musician', id: 0},
  {name: 'Princess', id: 1},
  {name: 'Spy', id: 2},
  {name: 'Assassin', id: 3},
  {name: 'Ambassador', id: 4},
  {name: 'Wizard', id: 5},
  {name: 'General', id: 6},
  {name: 'Prince', id: 7},
];

export let applewoodCards = [
  {name: 'Musician', id: 0},
  {name: 'Princess', id: 1},
  {name: 'Spy', id: 2},
  {name: 'Assassin', id: 3},
  {name: 'Ambassador', id: 4},
  {name: 'Wizard', id: 5},
  {name: 'General', id: 6},
  {name: 'Prince', id: 7},
];

export function fetchCard(name, id) {
  if (name === "yarg") return yargCards[id];
  else if (name === "applewood") return applewoodCards[id];
  else alert("error!")
}

export function fetchImage(name, id) {
  if (id < 0) return cover;
  if (name === "yarg") return yargImages[id];
  else if (name === "applewood") return applewoodImages[id];
  else alert("error!");
}