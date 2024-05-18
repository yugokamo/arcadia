FROM node:16.15.1 AS build
WORKDIR /arcadia_webfront
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build local

FROM nginx:1.19
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /arcadia_webfront/build /usr/share/nginx/html
EXPOSE 3000
ENV HOSTNAME "0.0.0.0"
CMD ["nginx", "-g", "daemon off;"]