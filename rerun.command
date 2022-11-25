while true
echo rerun started at `date`
do
  bun dev
  read -t 5 -p "...restarting in 5s. ^C to exit."
  echo rerun restarted at `date`
done