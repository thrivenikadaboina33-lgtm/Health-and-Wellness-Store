# Naturals Health and Wellness Store

This project contains the original frontend plus a Node.js/Express backend and SQLite database.

## Requirements
- Node.js 18 or later
- VS Code (recommended)

## Run the project
1. Open this folder in VS Code.
2. Open Terminal.
3. Run:
   ```bash
   npm install
   npm start
   ```
4. Open `http://localhost:3000` in your browser.

The database file `health.db` is created automatically when the server starts.

## API endpoints
- `GET /api/health` - backend status
- `POST /api/register` - create a user
- `POST /api/login` - login using username/email and password
- `GET /api/profile` - authenticated profile
- `POST /api/contact` - save contact message
- `GET /api/products` - product list

## Notes
- Passwords are hashed with bcryptjs.
- Login uses a JWT token.
- SQLite is used so no separate database server is required.
- The project is for educational/demo purposes. Health information on the original pages should not be treated as medical advice.


## Updated in this version
- All important website images are stored locally in `images/`, so remedies, features, reviews, medicines and essential oils do not depend on broken external image URLs.
- Added working search across remedies/products, medicines and essential oils.
- Clicking a remedy, essential oil or medicine now opens a detail dialog on the same page.
- Fixed the original JavaScript filename mismatch (`naturals.js` -> `javascript.js`).
- Shop Now now scrolls to the product catalogue, and product cards open their details.
- Existing backend, login, registration and database files were retained; this is the same project, not a new project.
