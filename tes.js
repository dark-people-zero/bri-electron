const readerExcel = require("./readerExcel");
const os = require('os');
const path = require("path");

var x = readerExcel(path.join(os.tmpdir(), 'rekkoribbri.xls'))
// console.log(x);
