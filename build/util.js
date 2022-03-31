const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

exports.writeTo = function(tplFile, data, outFile, base = __dirname) {
    const tplStr = fs.readFileSync(path.join(base, tplFile), {encoding:'utf-8'});
    const outStr = ejs.render(tplStr, data);
    const destPath = path.join(base, outFile)
    fs.writeFileSync(destPath, outStr);
    console.log(`write to ${destPath} finished.`)
};