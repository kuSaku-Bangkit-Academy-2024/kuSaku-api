FROM node:18.20.2
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV GOOGLE_APPLICATION_CREDENTIALS="./credentials.json"
EXPOSE 3000
CMD ["npm", "run", "start"]
