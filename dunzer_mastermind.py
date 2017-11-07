"""Python Mastermind
"""

import random


instructions = """
=== The Mastermind game ===

Object of the Game
The computer picks a sequence of 4 pegs, each one being one of any of six colors.
The object of the game is to guess the exact positions of the colors in the 
sequence in as few guesses as possible. After each guess, the computer 
gives you a score of exact and partial matches. A black peg indicates an exact
match, a white peg a partial match (right color, wrong position).

Rules
1. The sequence can contain pegs of colors: red, yellow, green, blue, purple, orange
2. A color can be used any number of times in the sequence.
3. All four pegs of the secret sequence will contain a color - 
   no blanks/empties are allowed.
4. Each guess must consist of 4 peg colors - no blanks.


You should enter each color of your guess separately at the prompt. Use lower case.
"""

# color variables
colors = ['red', 'yellow', 'green', 'blue', 'purple', 'orange']
# secrete code generation
secretCode = []
i=0
while i<4:
   color = random.randint(0,5)
   secretCode.append(colors[color])
   i=i+1
print 'Secret: ', secretCode

fullMatches=0
guessNum=1
while (fullMatches<>4):
    # Set up loop variables
    fullMatches = 0
    partialMatches = 0
    secretCodeCopy = secretCode[:]
    guess = []
    print 'Guess:', guessNum

    i=0		
    while i<len(secretCode):
      print 'Enter a color from:',
      print colors,
      color=raw_input()
      guess.append(color)
      i=i+1

    # Full matches
    i=0
    while i<len(guess):
      if guess[i] == secretCodeCopy[i]:
        fullMatches = fullMatches+ 1
        secretCodeCopy[i] = 'X'
        guess[i]='Y'
      i=i+1

    # Partial Matches
    i=0
    while i<len(guess):
      j=0
      while j<len(secretCodeCopy):
        if guess[i] == secretCodeCopy[j]:
          partialMatches = partialMatches+ 1
          secretCodeCopy[j] = 'X'
          guess[i]='Y'
        j=j+1
      i=i+1
    #print response
    print fullMatches,
    print ' blacks'
    print partialMatches,
    print ' whites'
    if fullMatches == 4:
        print 'You guessed it in',
	print guessNum
    guessNum=guessNum+1        
    