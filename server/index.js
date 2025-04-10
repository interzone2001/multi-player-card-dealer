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

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 