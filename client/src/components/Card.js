import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const getSuitColor = (suit) => {
  return suit === 'hearts' || suit === 'diamonds' ? '#dc004e' : '#000000';
};

const getSuitSymbol = (suit) => {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
    default: return '';
  }
};

const Card = ({ value, suit }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        width: 100,
        height: 140,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 1,
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
      }}
    >
      <Box>
        <Typography
          variant="h6"
          sx={{
            color: getSuitColor(suit),
            fontWeight: 'bold',
          }}
        >
          {value}
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            color: getSuitColor(suit),
          }}
        >
          {getSuitSymbol(suit)}
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right', transform: 'rotate(180deg)' }}>
        <Typography
          variant="h6"
          sx={{
            color: getSuitColor(suit),
            fontWeight: 'bold',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};

export default Card; 