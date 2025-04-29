FROM nginx:alpine

COPY dist/power-base/browser /usr/share/nginx/html
