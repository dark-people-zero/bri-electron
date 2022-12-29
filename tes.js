const moment = require("moment");
moment.locale('id');

var d = moment('Jumat, 30 Desember 2022 04:38:56', 'dddd, DD MMMM YYYY hh:mm:ss').format("YYYY-MM-DD");
console.log(d);

