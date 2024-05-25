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

export class State {
    constructor(score1, score2, hold, spy, general) {
      this.score1 = score1; // the current score of the Yargs
      this.score2 = score2; // the current score of the Applewoods
      this.hold = hold; // the number of points on hold
      this.spy = spy; // 0 = no spy, 1 = player1 has the spy benefit next round, 2 = player2 has the spy benefit next round
      this.general = general; // 0 = no general, 1 = player1 has general benefit next round, 2 = player2 has the general benefit next round
    }
}

export let yargImages = [musician1,princess1,spy1,assassin1,ambassador1,wizard1,general1,prince1];
export let applewoodImages = [musician2,princess2,spy2,assassin2,ambassador2,wizard2,general2,prince2];