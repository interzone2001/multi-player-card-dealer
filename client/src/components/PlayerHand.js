import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import Card from './Card';

const PlayerHand = ({ playerNumber, playerName, cards }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        backgroundColor: '#f8f9fa',
      }}
    >
      <Typography variant="h6" gutterBottom>
        {playerName ? playerName : `Player ${playerNumber}`}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'center',
        }}
      >
        {cards.map((card, index) => (
          <Card
            key={`${card.suit}-${card.value}-${index}`}
            suit={card.suit}
            value={card.value}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default PlayerHand; 