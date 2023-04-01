bun dev
lsof -t -i:3000,3001 && lsof -t -i:3000,3001 | xargs kill
