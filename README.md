# solanaUOD

Using AI as a helper to analyze tokens movements & trends on Solana

## Set-up

1. Install dependencies:

   ```sh
   npm install
   ```

1. Add Gemini API to enviroment
   > Get "YOUR_API" from [here](https://aistudio.google.com/app/apikey)
   ```sh
   cp .env.example .env;
   # you can edit your `.env` file directly or run this command
   echo "YOUR_API" >> .env;
   ```

1. Run application

   ```sh
   npm start
   ```

## Build

1. Build project run:

   ```sh
   npm run build
   ```

1. Install serve globally and serve:

   ```sh
   npm install -g serve
   serve -s build
   ```

## Testing

1. Run test from project directory

   ```sh
   npm test
   ```
