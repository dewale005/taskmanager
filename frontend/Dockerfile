# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

RUN npm install -g @angular/cli

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port Angular uses
EXPOSE 4200

# Run Angular dev server
CMD ["npm", "run", "start"]
