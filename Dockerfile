FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Build the Next.js app to generate the production build
RUN npm run build

# Set the PORT environment variable inside the container
ENV PORT=3001

EXPOSE 3001

# Start the Next.js production server
CMD ["npm", "start"]
