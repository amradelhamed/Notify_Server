FROM node:20
WORKDIR /app
COPY . /app
RUN npm install
ENV PORT 5000
EXPOSE 5000
CMD ["npm", "start"]
