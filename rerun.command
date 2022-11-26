while true
echo rerun started at `date`
do
  bun dev
  read -t 1 -p "...restarting in 1s. ^C to exit."
  echo rerun restarted at `date`
done