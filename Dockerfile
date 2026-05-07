# 1. Node 20 use karein kyunke aapki modern libraries ko yehi version chahiye
FROM node:20-slim

# 2. FFmpeg aur basic tools install karein
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 3. yt-dlp install karein (Linux version)
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# 4. Dependencies install karein
COPY package*.json ./
RUN npm install

COPY . .

# 5. Next.js build (Telemetry off taake build fast ho)
RUN NEXT_TELEMETRY_DISABLED=1 npm run build

EXPOSE 3000
CMD ["npm", "start"]