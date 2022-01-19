# NodeJS version
FROM node:latest
# Set app working directory
WORKDIR /usr/src/auth-service
# Copy node dependencies
COPY package*.json ./
# Run npm install for node dependencies
RUN npm install
# Copy app source code to working directory
COPY . .
# Expose port
EXPOSE 3000
# Run app
CMD ["node", "app.js"]
