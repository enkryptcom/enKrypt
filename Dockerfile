FROM node:22.11-bookworm
RUN apt-get update
RUN apt-get install build-essential zip -y
ENV HOME /home
ENV NODE_OPTIONS --max-old-space-size=8192
RUN node -v && npm -v && yarn -v
WORKDIR /home
