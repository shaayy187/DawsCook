# Używamy obrazu Node.js
FROM node:18-alpine

# Ustawiamy katalog roboczy
WORKDIR /app

# Kopiujemy package.json i package-lock.json
COPY package.json package-lock.json ./

# Instalujemy zależności
RUN npm install

# Kopiujemy resztę plików
COPY . .

# Otwieramy port 3000
EXPOSE 3000

# Uruchamiamy Reacta w trybie developerskim
CMD ["npm", "start", "start-watch"]
