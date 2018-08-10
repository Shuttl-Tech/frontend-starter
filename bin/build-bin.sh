#!/usr/bin/env bash
set -e
wp ./bin/index.js -o ./bin/_index.generated.js --target='node' --mode='production' --progress > /dev/null;
cat ./bin/node-shebang.txt > ./bin/index.generated.js;
cat ./bin/_index.generated.js >> ./bin/index.generated.js;
rm ./bin/_index.generated.js;
chmod 755 ./bin/index.generated.js
