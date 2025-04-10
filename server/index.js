const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '../client/build')));

// Card dealing logic
const calculateRequiredDecks = (numPlayers, cardsPerPlayer) => {
  const totalCardsNeeded = numPlayers * cardsPerPlayer;
  return Math.ceil(totalCardsNeeded / 52);
};

const calculateRequiredDecksForCustomPlayers = (players) => {
  const totalCardsNeeded = players.reduce((sum, player) => sum + player.number_cards, 0);
  return Math.ceil(totalCardsNeeded / 52);
};

const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const createDeck = () => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck = [];
  
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  
  return deck;
};

// Routes
app.post('/api/deal', (req, res) => {
  const { numPlayers, cardsPerPlayer } = req.body;
  
  if (!numPlayers || !cardsPerPlayer) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  if (numPlayers > 60 || cardsPerPlayer > 18) {
    return res.status(400).json({ error: 'Invalid number of players or cards per player' });
  }
  
  const numDecks = calculateRequiredDecks(numPlayers, cardsPerPlayer);
  let allCards = [];
  
  // Create and shuffle all required decks
  for (let i = 0; i < numDecks; i++) {
    allCards = [...allCards, ...shuffleDeck(createDeck())];
  }
  
  // Shuffle all cards together again for better randomization
  allCards = shuffleDeck(allCards);
  
  // Deal cards to players
  const dealtCards = [];
  for (let i = 0; i < numPlayers; i++) {
    dealtCards.push(allCards.slice(i * cardsPerPlayer, (i + 1) * cardsPerPlayer));
  }
  
  res.json({
    numDecks,
    dealtCards,
    remainingCards: allCards.slice(numPlayers * cardsPerPlayer)
  });
});

// Custom player data dealing
app.post('/api/deal-custom', (req, res) => {
  const { players } = req.body;
  
  if (!players || !Array.isArray(players) || players.length === 0) {
    return res.status(400).json({ error: 'Invalid player data. Please provide a valid array of players.' });
  }
  
  if (players.length > 60) {
    return res.status(400).json({ error: 'Maximum number of players exceeded. Please limit to 60 players.' });
  }
  
  // Validate each player has valid number_cards
  const invalidPlayers = players.filter(player => 
    !player.number_cards || 
    player.number_cards <= 0 || 
    player.number_cards > 18
  );
  
  if (invalidPlayers.length > 0) {
    return res.status(400).json({ 
      error: 'Some players have invalid number of cards. Each player must have between 1 and 18 cards.' 
    });
  }
  
  const numDecks = calculateRequiredDecksForCustomPlayers(players);
  let allCards = [];
  
  // Create and shuffle all required decks
  for (let i = 0; i < numDecks; i++) {
    allCards = [...allCards, ...shuffleDeck(createDeck())];
  }
  
  // Shuffle all cards together again for better randomization
  allCards = shuffleDeck(allCards);
  
  // Deal cards to players based on their requested amount
  const dealtCards = [];
  let cardIndex = 0;
  
  for (const player of players) {
    const playerCards = allCards.slice(cardIndex, cardIndex + player.number_cards);
    dealtCards.push(playerCards);
    cardIndex += player.number_cards;
  }
  
  res.json({
    numDecks,
    dealtCards,
    remainingCards: allCards.slice(cardIndex)
  });
});

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 