lsof -t -i:3000,3001 && lsof -t -i:3000,3001 | xargs kill
while true
echo rerun started at `date`
do
  bun dev
  read -t 1 -p "...restarting in 1s. ^C to exit."
  echo rerun restarted at `date`
done