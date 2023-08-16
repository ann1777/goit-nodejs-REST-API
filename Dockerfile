# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Copy the rest of the application files to the working directory
COPY . .

# Install dependencies
RUN npm install

#Build the application
RUN npm run build

# Expose the port that the application will run on
EXPOSE 3000

# Start the application via nodemon using your production start script
CMD [ "npm", "run", "start:dev" ]
