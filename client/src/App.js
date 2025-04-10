import React, { useState, useRef } from 'react';
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
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Card from './components/Card';
import PlayerHand from './components/PlayerHand';

function App() {
  const [numPlayers, setNumPlayers] = useState(60);
  const [cardsPerPlayer, setCardsPerPlayer] = useState(5);
  const [dealtCards, setDealtCards] = useState([]);
  const [numDecks, setNumDecks] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const cardsRef = useRef(null);

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

  const handleExportPDF = async () => {
    if (!cardsRef.current || dealtCards.length === 0) return;
    
    try {
      setLoading(true);
      
      // Create a new jsPDF instance
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Add title
      pdf.setFontSize(16);
      pdf.text('Card Dealing Results', pdfWidth / 2, 10, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`${numPlayers} Players, ${cardsPerPlayer} Cards Each, ${numDecks} Decks Used`, pdfWidth / 2, 18, { align: 'center' });
      
      // Capture the cards display
      const canvas = await html2canvas(cardsRef.current, { 
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate image dimensions to fit on the PDF
      const imgWidth = pdfWidth - 20; // Margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let position = 25; // Start position after the title
      
      // Add the image
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      
      // Check if we need additional pages
      if (position + imgHeight > pdfHeight) {
        let heightLeft = imgHeight;
        let currentPosition = position;
        
        while (heightLeft > 0) {
          pdf.addPage();
          const pageUsableHeight = pdfHeight - 20; // Margins
          
          pdf.addImage(
            imgData, 
            'PNG', 
            10, 
            10 - currentPosition, 
            imgWidth, 
            imgHeight
          );
          
          heightLeft -= pageUsableHeight;
          currentPosition += pageUsableHeight;
        }
      }
      
      // Save the PDF
      pdf.save('card_dealing_results.pdf');
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Error generating PDF. Please try again.');
    } finally {
      setLoading(false);
    }
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
                  disabled={dealtCards.length === 0 || loading}
                >
                  Export to Excel
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleExportPDF}
                  disabled={dealtCards.length === 0 || loading}
                >
                  Export to PDF
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

        <Box ref={cardsRef}>
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
      </Box>
    </Container>
  );
}

export default App; 