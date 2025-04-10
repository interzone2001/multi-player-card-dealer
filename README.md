# Multi-Player Card Dealer

A simple web application for dealing cards to multiple players (up to 60) with a beautiful visual interface and Excel/PDF export functionality.

## Quick Start (Windows)

1. Install Docker Desktop:
   - Download from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
   - Run the installer
   - Restart your computer if prompted

2. Run the application:
   - Double-click the `start-card-dealer.bat` file
   - Wait for the application to start (this may take a few minutes the first time)
   - Open your web browser and go to `http://localhost:3000`

## Features

- Deal cards to up to 60 players
- Specify number of cards per player (up to 18)
- Import player data from Excel files
- Automatic deck calculation
- Visual card display with suit symbols
- Excel export functionality
- PDF export of card visuals
- Responsive design

## How to Use

### Standard Dealing

1. Enter the number of players (1-60)
2. Specify the number of cards per player (1-18)
3. Click "Deal Cards" to distribute the cards
4. Use "Export to Excel" to save the distribution as a spreadsheet
5. Use "Export to PDF" to save the visual card layout

### Importing Player Data

1. Prepare an Excel file (.xlsx or .xls) with the following columns:
   - `player_name`: The name of each player
   - `number_cards`: The number of cards to deal to each player (1-18)

2. Click "Import Player Data" and select your Excel file
3. Review the imported data in the preview table
4. Click "Deal Cards" to distribute cards based on the imported player data
5. Cards will be displayed with the player names from your Excel file
6. Export the results to Excel or PDF as needed

#### Example Excel Format

| player_name | number_cards |
|-------------|--------------|
| John        | 5            |
| Mary        | 7            |
| Bob         | 3            |

## Troubleshooting

If you encounter any issues:

1. Make sure Docker Desktop is running
2. Try closing and reopening Docker Desktop
3. If the application doesn't start, try running the `start-card-dealer.bat` file again

## System Requirements

- Windows 10 or later
- 4GB RAM minimum
- 2GB free disk space
- Internet connection (for first-time setup)

## License

MIT 