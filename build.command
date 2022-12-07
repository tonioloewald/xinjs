rm -rf ./cdn

echo rolling up
npx rollup -c

echo uglifying
uglifyjs cdn/index.mjs -c -m -cmo cdn/index.min.mjs --source-map url=cdn/index.min.mjs.map
uglifyjs cdn/index.js -c -m -cmo cdn/index.min.js --source-map url=cdn/index.min.js.map

echo done
