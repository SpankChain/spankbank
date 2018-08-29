FROM node:10

WORKDIR /usr/src/spankbank
ADD . $WORKDIR
RUN npm install
RUN npm install -g truffle

CMD truffle test test/spank.js
