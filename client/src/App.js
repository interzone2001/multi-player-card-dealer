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
  Input,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  const fileInputRef = useRef(null);
  
  // Import player data states
  const [playerData, setPlayerData] = useState([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importError, setImportError] = useState('');
  const [usingImportedData, setUsingImportedData] = useState(false);

  const handleDeal = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (usingImportedData && playerData.length > 0) {
        // Deal cards based on imported player data
        const response = await axios.post('http://localhost:3000/api/deal-custom', {
          players: playerData
        });
        setDealtCards(response.data.dealtCards);
        setNumDecks(response.data.numDecks);
      } else {
        // Deal cards based on standard input
        const response = await axios.post('http://localhost:3000/api/deal', {
          numPlayers,
          cardsPerPlayer,
        });
        setDealtCards(response.data.dealtCards);
        setNumDecks(response.data.numDecks);
        setUsingImportedData(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while dealing cards');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const workbook = XLSX.utils.book_new();
    
    let worksheetData;
    if (usingImportedData) {
      worksheetData = dealtCards.map((playerHand, index) => ({
        'Player Name': playerData[index].player_name,
        'Cards': playerHand.cards.map(card => `${card.value} of ${card.suit}`).join(', ')
      }));
    } else {
      worksheetData = dealtCards.map((cards, index) => ({
        'Player Number': index + 1,
        'Cards': cards.map(card => `${card.value} of ${card.suit}`).join(', ')
      }));
    }
    
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
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
      
      if (usingImportedData) {
        pdf.text(`${playerData.length} Players, Custom Cards Per Player, ${numDecks} Decks Used`, pdfWidth / 2, 18, { align: 'center' });
      } else {
        pdf.text(`${numPlayers} Players, ${cardsPerPlayer} Cards Each, ${numDecks} Decks Used`, pdfWidth / 2, 18, { align: 'center' });
      }
      
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
  
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        // Validate that the Excel file has the required columns
        if (jsonData.length === 0) {
          setImportError('The Excel file does not contain any data.');
          setIsImportDialogOpen(true);
          return;
        }
        
        const firstRow = jsonData[0];
        if (!('player_name' in firstRow) || !('number_cards' in firstRow)) {
          setImportError('The Excel file must contain columns named "player_name" and "number_cards".');
          setIsImportDialogOpen(true);
          return;
        }
        
        // Process and validate the data
        const processedData = jsonData.map(row => ({
          player_name: String(row.player_name),
          number_cards: parseInt(row.number_cards)
        }));
        
        // Check if number_cards values are valid
        const invalidEntries = processedData.filter(item => 
          isNaN(item.number_cards) || item.number_cards <= 0 || item.number_cards > 18
        );
        
        if (invalidEntries.length > 0) {
          setImportError('Some entries have invalid number of cards. Each player must have between 1 and 18 cards.');
          setIsImportDialogOpen(true);
          return;
        }
        
        // If everything is valid, update state
        setPlayerData(processedData);
        setUsingImportedData(true);
        setIsImportDialogOpen(true);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
      } catch (error) {
        console.error('Error reading Excel file:', error);
        setImportError('Error reading Excel file. Please make sure it is a valid Excel file.');
        setIsImportDialogOpen(true);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  const handleCloseImportDialog = () => {
    setIsImportDialogOpen(false);
    setImportError('');
  };
  
  const resetToManualInput = () => {
    setUsingImportedData(false);
    setPlayerData([]);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Multi-Player Card Dealer
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            {!usingImportedData ? (
              <>
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
              </>
            ) : (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Using Imported Player Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {playerData.length} players loaded from Excel
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small" 
                    onClick={resetToManualInput}
                    sx={{ mt: 1 }}
                  >
                    Switch to Manual Input
                  </Button>
                </Box>
                
                <TableContainer component={Paper} sx={{ maxHeight: 200, mb: 2 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Player Name</TableCell>
                        <TableCell align="right">Cards to Deal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {playerData.map((player, index) => (
                        <TableRow key={index}>
                          <TableCell>{player.player_name}</TableCell>
                          <TableCell align="right">{player.number_cards}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
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
                  color="primary"
                  onClick={handleImportClick}
                  disabled={loading}
                >
                  Import Player Data
                </Button>
                
                <Input
                  type="file"
                  inputRef={fileInputRef}
                  onChange={handleFileChange}
                  sx={{ display: 'none' }}
                  inputProps={{ accept: '.xlsx,.xls' }}
                />
                
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
            {dealtCards.map((data, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <PlayerHand
                  playerName={usingImportedData && playerData[index] ? playerData[index].player_name : null}
                  playerNumber={index + 1}
                  cards={data}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
      
      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onClose={handleCloseImportDialog}>
        <DialogTitle>
          {importError ? "Import Error" : "Import Successful"}
        </DialogTitle>
        <DialogContent>
          {importError ? (
            <DialogContentText color="error">
              {importError}
            </DialogContentText>
          ) : (
            <>
              <DialogContentText>
                Successfully imported {playerData.length} player(s).
              </DialogContentText>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Total cards needed: {playerData.reduce((sum, player) => sum + player.number_cards, 0)}
              </Typography>
              <Typography variant="body2">
                Click "Deal Cards" to deal the cards to the imported players.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App; 