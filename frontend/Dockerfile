# Tek aşamalı, basit bir imaj: bundle'ı derler ve Vite'ın kendi preview sunucusuyla
# servis eder. nginx'e gerek yok — preview sunucusu vite.config.ts'teki /api proxy
# ayarını da kullandığı için tarayıcı uygulamayı yine same-origin görür.
FROM node:22-slim

WORKDIR /app

# Bağımlılıklar önce kopyalanır ki kaynak değiştiğinde bu katman cache'ten gelsin.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# BFF adresi; compose içinde client servisinin adresiyle override edilir.
ENV VITE_API_PROXY_TARGET=http://localhost:8080

EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
