FROM node:10

WORKDIR /usr/src/spankbank
ADD . $WORKDIR
RUN npm install
RUN npm install -g truffle@v5.0.0-beta.0

CMD truffle test test/spank.js
