#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <sstream>
#include <queue>
#include <deque>
#include <bitset>
#include <iterator>
#include <list>
#include <stack>
#include <map>
#include <set>
#include <functional>
#include <numeric>
#include <utility>
#include <limits>
#include <time.h>
#include <math.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <assert.h>
using namespace std;

struct state {
    int score1; //the current score of the Yargs
    int score2; //the current score of the Applewoods
    int hold; //the number of points on hold
    int spy; //0 = no spy, 1 = player1 has the spy benefit next round, 2 = player2 has the spy benefit next round
    int general; //0 = no general, 1 = player1 has general benefit next round, 2 = player2 has the general benefit next round
};

struct game {
    int bit1; //bitmask of cards held by player1
    int bit2; //bitmask of cards held by player2
    state s; //the current gamestate;
};


/*
Return the outcome of a single round

{score1, score2, hold, spy (0,1,2), general (0,1,2)}
*/

//0 = hold, positive = points for team1, negative = points for team2
vector<vector<int>> results = { 
    {0, 0, 0, 0, 0,-1, 0, 0},
    {0, 0,-1, 1,-2,-1,-1, 4},
    {0, 1, 0, 1,-2,-1,-1,-1},
    {0,-1,-1, 0, 1,-1, 1,-1},
    {0, 2, 2,-1, 0,-1,-1,-1},
    {1, 1, 1, 1, 1, 0,-1,-1},
    {0, 1, 1,-1, 1, 1, 0,-1},
    {0,-4, 1, 1, 1, 1, 1, 0}
};
//matrix for general1 results
vector<vector<int>> generalResults = {
    {0, 0, 0, 0, 0,-1, 0, 0},
    {0, 1, 1, 0,-2,-1,-1, 4},
    {0, 1, 1,-1, 0,-1,-1,-1},
    {0,-1,-1,-1,-2, 0, 1,-1},
    {0, 2, 2,-1, 2, 1, 0,-1},
    {1, 1, 1, 1, 1, 1, 1, 0},
    {0, 1, 1,-1, 1, 1, 1,-1},
    {0,-4, 1, 1, 1, 1, 1, 1}
};
state round(int card1, int card2, bool general1, bool general2) {
    int score;
    if ((general1 ^ general2) == 0) score = results[card1][card2];
    else if (general1) score = generalResults[card1][card2];
    else score = -1 * generalResults[card2][card1];

    int score1 = score > 0 ? score : 0;
    int score2 = score < 0 ? -1 * score : 0;
    int hold = score == 0;
    int spy = 0;
    if (card1 == card2) spy = 0;
    else if (card1 == 2 && card2 != 5) spy = 1;
    else if (card2 == 2 && card1 != 5) spy = 2;
    int general = 0;
    if (card1 == card2) general = 0;
    else if (card1 == 6 && card2 != 5) general = 1;
    else if (card2 == 6 && card1 != 5) general = 2;

    state ans = {score1, score2, hold, spy, general};
    return ans;
}

/*
Given a state, return a new state resulting from a specific card combination played.
*/
state playMove(state cur, int card1, int card2) {
    state delta = round(card1,card2,cur.general==1,cur.general==2);

    int score1 = cur.score1 + delta.score1;
    if (delta.score1 > 0) score1 += cur.hold;
    int score2 = cur.score2 + delta.score2;
    if (delta.score2 > 0) score2 += cur.hold;
    int hold = delta.hold > 0 ? 1 + cur.hold : 0;
    
    state ans = {min(4,score1),min(4,score2),min(4,hold),delta.spy,delta.general};
    return ans;
}

// Function to count the number of 1 bits in an integer
int countOneBits(int n) {
    return bitset<32>(n).count();
}

/*
Data used to store our state
*/
double prob[1<<8][1<<8][4][4][5][3][3]; //1 if player1 wins, -1 if player2 wins, 0 if draw.
bool visited[1<<8][1<<8][4][4][5][3][3]; //if state is accessible
double outcome[8][8]; //used in intermediate calculations


//Compute the Nash Equilbrium with regret minimization
vector<double> getStrategy(vector<double>& regret) {
    int c = regret.size();
    vector<double> strategy(c,0.0);
    double s = 0;
    for (int i = 0; i < c; i++) {
        strategy[i] = max(0.0,regret[i]);
        s += strategy[i];
    }

    if (s > 1e-5) {
        for (int i = 0; i < c; i++) strategy[i] /= s;
    } else {
        for (int i = 0; i < c; i++) strategy[i] = 1.0/c;
    }
    return strategy;
}

double nash(int c, int iters) {
    vector<double> sum1(c,0.0);
    vector<double> sum2(c,0.0);
    vector<double> regret1(c,0.0);
    vector<double> regret2(c,0.0);

    for (int iter = 0; iter < iters; iter++) {
        vector<double> s1 = getStrategy(regret1);
        vector<double> s2 = getStrategy(regret2);
        for (int i = 0; i < c; i++) {
            sum1[i] += s1[i];
            sum2[i] += s2[i];
        }

        for (int a1 = 0; a1 < c; a1++) {
            for (int a2 = 0; a2 < c; a2++) {
                for (int a = 0; a < c; a++) {
                    regret1[a] += (outcome[a][a2] - outcome[a1][a2]) * (s1[a1] * s2[a2]);
                    regret2[a] -= (outcome[a1][a] - outcome[a1][a2]) * (s1[a1] * s2[a2]);
                }
            }
        }
    }

    vector<double> ans1(c,0.0);
    vector<double> ans2(c,0.0);
    for (int i = 0; i < c; i++) {
        ans1[i] = sum1[i]/iters;
        ans2[i] = sum2[i]/iters;
    }

    double ev = 0;
    for (int i = 0; i < c; i++) {
        for (int j = 0; j < c; j++) {
            ev += outcome[i][j] * ans1[i] * ans2[j];
        }
    }

    return ev;
}

/*
If a spy was used, then this round is played with perfect information
*/
double minmax(int c, int spy) {
    if (spy == 1) {
        double ans = 1.0;
        for (int j = 0; j < c; j++) {
            double val = -1.0;
            for (int i = 0; i < c; i++) {
                val = max(val,outcome[i][j]);
            }
            ans = min(ans,val);
        }
        return ans;
    } else {
        double ans = -1.0;
        for (int i = 0; i < c; i++) {
            double val = 1.0;
            for (int j = 0; j < c; j++) {
                val = min(val,outcome[i][j]);
            }
            ans = max(ans,val);
        }
        return ans;
    }
}

void solve(int iters) {
    //mark the game value of all terminal states
    for (int p1 = 0; p1 < 4; p1++) {
        for (int p2 = 0; p2 < 4; p2++) {
            for (int h = 0; h <= 4; h++) {
                for (int spy = 0; spy < 3; spy++) {
                    for (int gen = 0; gen < 3; gen++) {
                        if (p1 > p2) prob[0][0][p1][p2][h][spy][gen] = 1.0; //p1 wins
                        else if (p1 < p2) prob[0][0][p1][p2][h][spy][gen] = -1.0; //p2 wins
                        else prob[0][0][p1][p2][h][spy][gen] = 0.0; //draw
                    }
                }
            }
        }
    }

    for (int c = 1; c <= 8; c++) {
        vector<int> hands;
        for (int bit = 0; bit < 256; bit++) {
            if (countOneBits(bit) == c) hands.push_back(bit);
        }
        
        /*
            Bitmask of cards available to player 1 (yarg)
            Bitmask of cards available to player 2 (applewood)
            Player 1 points
            Player 2 points
            Number of points on hold
            Spy (0,1,2)
            General (0,1,2)
        */

        for (int bit1: hands) {
            for (int bit2: hands) {
                vector<int> cards1, cards2;
                for (int i = 0; i < 8; i++) {
                    if ((bit1 & (1 << i)) > 0) cards1.push_back(i);
                    if ((bit2 & (1 << i)) > 0) cards2.push_back(i);
                }

                for (int p1 = 0; p1 < 4; p1++) {
                    for (int p2 = 0; p2 < 4; p2++) {
                        for (int h = 0; h <= 4; h++) {
                            for (int gen = 0; gen < 3; gen++) {
                                bool vis = false;
                                for (int spy = 0; spy < 3; spy++) vis |= visited[bit1][bit2][p1][p2][h][spy][gen];
                                if (!vis) {
                                    //this state is unreachable so skip it
                                    continue;
                                }

                                state cur = {p1,p2,h,0,gen};
                                for (int i = 0; i < c; i++) {
                                    for (int j = 0; j < c; j++) {
                                        int c1 = cards1[i];
                                        int c2 = cards2[j];
                                        state result = playMove(cur,c1,c2);
                                        if (result.score1 == 4) outcome[i][j] = 1.0;
                                        else if (result.score2 == 4) outcome[i][j] = -1.0;
                                        else outcome[i][j] = prob[bit1 ^ (1 << c1)][bit2 ^ (1 << c2)][result.score1][result.score2][result.hold][result.spy][result.general];
                                    }
                                }

                                //spy == 0 : find Nash Equilibrium
                                if (visited[bit1][bit2][p1][p2][h][0][gen]) prob[bit1][bit2][p1][p2][h][0][gen] = nash(c, iters);

                                //spy == 1 or 2: find min max solution
                                if (visited[bit1][bit2][p1][p2][h][1][gen]) prob[bit1][bit2][p1][p2][h][1][gen] = minmax(c,1);
                                if (visited[bit1][bit2][p1][p2][h][2][gen]) prob[bit1][bit2][p1][p2][h][2][gen] = minmax(c,2);
                            }
                        }
                    }
                }
            }
        }
    }
}

/*
Mark all reachable states in the visited matrix.

There are only 414163 distinguishable states in Brave Rats!
*/
void findAllStates() {
    queue<game> bfs;
    state root = {0,0,0,0,0};
    game gameroot = {255,255,root};
    visited[255][255][0][0][0][0][0] = true;
    bfs.push(gameroot);
    while (!bfs.empty()) {
        game cur = bfs.front(); bfs.pop();
        for (int c1 = 0; c1 < 8; c1++) {
            if ((cur.bit1 & (1<<c1)) == 0) continue;
            for (int c2 = 0; c2 < 8; c2++) {
                if ((cur.bit2 & (1<<c2)) == 0) continue;

                state next = playMove(cur.s,c1,c2);
                if (next.score1 == 4 || next.score2 == 4) {
                    //terminal state
                    continue;
                }

                int bit1 = cur.bit1 ^ (1 << c1);
                int bit2 = cur.bit2 ^ (1 << c2);
                if (!visited[bit1][bit2][next.score1][next.score2][next.hold][next.spy][next.general]) {
                    visited[bit1][bit2][next.score1][next.score2][next.hold][next.spy][next.general] = true;
                    game nextgame = {bit1,bit2,next};
                    bfs.push(nextgame);
                }
            }
        }
    }
}

/*
Write to a txt file for use in the solver frontend
*/
void printToFile() {
    freopen("public/braverats.txt","w",stdout);
    for (int bit1 = 0; bit1 < 256; bit1++) {
        for (int bit2 = 0; bit2 < 256; bit2++) {
            for (int p1 = 0; p1 < 4; p1++) {
                for (int p2 = 0; p2 < 4; p2++) {
                    for (int h = 0; h <= 4; h++) {
                        for (int spy = 0; spy < 3; spy++) {
                            for (int gen = 0; gen < 3; gen++) {
                                if (visited[bit1][bit2][p1][p2][h][spy][gen]) {
                                    double ev = prob[bit1][bit2][p1][p2][h][spy][gen];
                                    cout << bit1 << ',' << bit2 << ',' << p1 << ',' << p2 << ',' << h << ',' << spy << ',' << gen << ',' << ev << '\n';
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

int main() {
    findAllStates(); //find all accessible game states

    solve(10000); //solve all states in bottom up order (took around 1 hour on my machine)

    printToFile(); //print the nash-value of a state to a file (for use in frontend)
}