echo rolling up
npx rollup -c

echo removing ts-build
rm -r ts-build

echo uglifying
uglifyjs dist/xin.mjs -c -m -cmo dist/xin.min.mjs --source-map url=dist/xin.min.mjs.map
uglifyjs dist/xin.js -c -m -cmo dist/xin.min.js --source-map url=dist/xin.min.js.map
uglifyjs dist/xin.iife.js -c -m -cmo dist/xin.iife.min.js --source-map url=dist/xin.iife.min.js.map

echo done
