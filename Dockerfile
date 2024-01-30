# Use an official Node.js runtime as a parent image
FROM node:16

# Copy the rest of the application code to the container
COPY . .

# Install dependencies

RUN npm install
RUN npm run build

EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]
