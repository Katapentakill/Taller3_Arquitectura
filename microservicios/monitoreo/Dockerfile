FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Script de espera para MongoDB y RabbitMQ
COPY ./scripts/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

EXPOSE 50058

CMD ["/wait-for-it.sh", "monitoreo-db:27017", "--", "/wait-for-it.sh", "rabbitmq:5672", "--", "npm", "run", "start"]
