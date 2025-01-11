# Use the official Node.js 20 image as the base
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to the container
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally and install dependencies
RUN npm install -g pnpm && pnpm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN pnpm build

# Set environment variables
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Define the command to run the application
CMD ["node", "dist/index.js"]
