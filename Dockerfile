FROM node:16-stretch
RUN apt update
RUN apt install build-essential
ENV HOME /home
ENV NODE_OPTIONS --max-old-space-size=8192
RUN node -v && npm -v && yarn -v
WORKDIR /home