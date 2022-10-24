rm -r ./dist

echo rolling up
npx rollup -c

echo uglifying
uglifyjs dist/index.mjs -c -m -cmo dist/index.min.mjs --source-map url=dist/index.min.mjs.map
uglifyjs dist/index.js -c -m -cmo dist/index.min.js --source-map url=dist/index.min.js.map

echo done
