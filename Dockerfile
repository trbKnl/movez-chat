FROM node:21

# build-time args
ARG DOMAIN_NAME

COPY . .

RUN echo "VITE_DOMAIN=$DOMAIN_NAME" > .env
RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
