# Step 1: Build the Angular application
FROM node:22.3.0 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application source code to the working directory
COPY . .

# Build the Angular application
RUN npm run build --prod

# Step 2: Serve the application using Nginx
# Use the official Nginx image as the base image
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built Angular application from the build stage to the Nginx HTML directory
COPY --from=build /app/dist/rzume_web/browser /usr/share/nginx/html

# Copy a custom Nginx configuration file


# Expose port 80 to the outside world (Nginx default)
EXPOSE 3000

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
