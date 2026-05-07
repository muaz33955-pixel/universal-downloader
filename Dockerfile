# 1. Linux ka base system (Debian) aur Node.js 18 install karo
FROM node:18-bullseye

# 2. Server par FFmpeg, Python aur Curl install karo
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 3. yt-dlp ka latest Linux version download aur install karo
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
RUN chmod a+rx /usr/local/bin/yt-dlp

# 4. Project ke liye folder banao aur files copy karo
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# 5. Next.js project ko build karo
RUN npm run build

# 6. Render.com ke liye Port aur Host set karo (Bohot Zaroori)
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

# 7. Server ko start karo
CMD ["npm", "start"]