import json

def extend(n):
    while len(n) < 3: n = "0" + n
    return n

f = open('public/braverats.txt','r')

braverats = {}
for line in f:
    x = line.strip().split(',')
    bit1 = extend(x[0])
    bit2 = extend(x[1])
    hash = bit1 + bit2 + ''.join(x[2:len(x)-1])

    ev = float(x[-1])
    braverats[hash] = ev

"""
Create a json dictionary (for use in the frontend)

The key is a hash of length 11 (bit1,bit2,score1,score2,hold,spy,general)

The value is the calculated EV of the state (nash.cpp)
"""
with open("public/braverats.json", "w") as outfile: 
    json.dump(braverats, outfile)