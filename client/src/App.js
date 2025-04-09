import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Card from './components/Card';
import PlayerHand from './components/PlayerHand';

function App() {
  const [numPlayers, setNumPlayers] = useState(60);
  const [cardsPerPlayer, setCardsPerPlayer] = useState(5);
  const [dealtCards, setDealtCards] = useState([]);
  const [numDecks, setNumDecks] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeal = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.post('http://localhost:3000/api/deal', {
        numPlayers,
        cardsPerPlayer,
      });
      setDealtCards(response.data.dealtCards);
      setNumDecks(response.data.numDecks);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while dealing cards');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(
      dealtCards.map((cards, index) => ({
        'Player Number': index + 1,
        'Cards': cards.map(card => `${card.value} of ${card.suit}`).join(', ')
      }))
    );
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dealt Cards');
    XLSX.writeFile(workbook, 'dealt_cards.xlsx');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Multi-Player Card Dealer
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Players"
                type="number"
                value={numPlayers}
                onChange={(e) => setNumPlayers(Math.min(60, Math.max(1, parseInt(e.target.value) || 0)))}
                inputProps={{ min: 1, max: 60 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cards per Player"
                type="number"
                value={cardsPerPlayer}
                onChange={(e) => setCardsPerPlayer(Math.min(18, Math.max(1, parseInt(e.target.value) || 0)))}
                inputProps={{ min: 1, max: 18 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleDeal}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  Deal Cards
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleExport}
                  disabled={dealtCards.length === 0}
                >
                  Export to Excel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {numDecks > 0 && (
          <Typography variant="h6" sx={{ mb: 2 }}>
            Using {numDecks} deck{numDecks > 1 ? 's' : ''}
          </Typography>
        )}

        <Grid container spacing={3}>
          {dealtCards.map((cards, playerIndex) => (
            <Grid item xs={12} sm={6} md={4} key={playerIndex}>
              <PlayerHand
                playerNumber={playerIndex + 1}
                cards={cards}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default App; 