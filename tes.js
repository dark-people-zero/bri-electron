// var HTMLParser = require("node-html-parser");
// var str = `
//     <table>
//         <thead>
//             <tr>
//                 <th align="left"><b>Nomor Rekening&nbsp;&nbsp;</b></th>
//                 <th align="left"><b>Jenis Produk</b></th>
//                 <th align="left"><b>Nama</b></th>
//                 <th align="left"><b>Mata Uang</b></th>
//                 <th align="right"><b>Saldo</b></th>
//             </tr>
//         </thead>
//         <tbody>
//             <tr class="x" id="Any_0" valign="top">
//                 <td valign="top">763801002587507&nbsp;</td>
//                 <td valign="top">BritAma&nbsp;</td>
//                 <td valign="top">MAHADI WIJAYA &nbsp;</td>
//                 <td valign="top">IDR&nbsp;</td>
//                 <td valign="top" style="text-align: right">898.487,00&nbsp;</td>
//             </tr>
//         </tbody>
//     </table>
// `
// var root = HTMLParser.parse(str);

// var data = root.querySelector("tbody tr td:last-child").innerText;
// data = data.replaceAll("&nbsp", "").replaceAll(".","").replaceAll(",",".");
// console.log(parseFloat(data));


// const db = require("./libraries/db");
// (async() => {
//     var x = await db.saldo({
//         data: {
//             "saldo": 200000,
//         },
//         norek: "312312321312",
//         username: "dasdasda",
//         email: "dasdsadas",
//         time: "2023-01-24"
//     })

//     console.log(x);

// })()

// const moment = require("moment");
// moment.locale("id");
// var time = "Rabu, 25 Januari 2023 07:35:17";
// var now = moment(time, "dddd, DD MMMM YYYY hh:mm:ss").format("YYYY-MM-DD");
// console.log(now);
// console.log(moment().format("dddd, DD MMMM YYYY hh:mm:ss"));

// var dt = [
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB WINDI SUCI YAN TO HESTI SEPTIYANI",
//       "saldo": "5.548.056,00",
//       "type": "CR",
//       "amount": "65.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB SUPIRMAN TO HESTI SEPTIYANI",
//       "saldo": "5.648.056,00",
//       "type": "CR",
//       "amount": "100.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "BFST304001022465536VISIONET INT:BDINIDJA",
//       "saldo": "5.898.056,00",
//       "type": "CR",
//       "amount": "250.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB EDI TRI WALUYO TO HESTI SEPTIYANI",
//       "saldo": "5.948.056,00",
//       "type": "CR",
//       "amount": "50.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB ANAS ARIFIN TO HESTI SEPTIYANI",
//       "saldo": "6.047.056,00",
//       "type": "CR",
//       "amount": "99.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB RIO GUSPENDI TO HESTI SEPTIYANI",
//       "saldo": "6.077.056,00",
//       "type": "CR",
//       "amount": "30.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB MAMAN RUSMAN TO HESTI SEPTIYANI",
//       "saldo": "6.177.470,00",
//       "type": "CR",
//       "amount": "100.414,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB RIYANTO TO HESTI SEPTIYANI",
//       "saldo": "6.477.470,00",
//       "type": "CR",
//       "amount": "300.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "231P03GZ00917047",
//       "saldo": "7.467.470,00",
//       "type": "CR",
//       "amount": "990.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB CARIDIN TO HESTI SEPTIYANI",
//       "saldo": "7.517.470,00",
//       "type": "CR",
//       "amount": "50.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB SUHARDIN TO HESTI SEPTIYANI",
//       "saldo": "7.717.470,00",
//       "type": "CR",
//       "amount": "200.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB RIO GUSPENDI TO HESTI SEPTIYANI",
//       "saldo": "7.747.470,00",
//       "type": "CR",
//       "amount": "30.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER ATMSTRPRM 08888 000154663 7570909716",
//       "saldo": "7.740.970,00",
//       "type": "DB",
//       "amount": "6.500,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER ATMSTRPRM 08888 000154663 7570909716",
//       "saldo": "240.970,00",
//       "type": "DB",
//       "amount": "7.500.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB RIAN TRIYANA TO HESTI SEPTIYANI",
//       "saldo": "280.970,00",
//       "type": "CR",
//       "amount": "40.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB RIAN TRIYANA TO HESTI SEPTIYANI",
//       "saldo": "355.970,00",
//       "type": "CR",
//       "amount": "75.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB SAIPUL TO HESTI SEPTIYANI",
//       "saldo": "456.970,00",
//       "type": "CR",
//       "amount": "101.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB TEGUH WIBOWO TO HESTI SEPTIYANI",
//       "saldo": "556.970,00",
//       "type": "CR",
//       "amount": "100.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB AWAL HIDAYAT TO HESTI SEPTIYANI",
//       "saldo": "1.066.970,00",
//       "type": "CR",
//       "amount": "510.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB SUPIRMAN TO HESTI SEPTIYANI",
//       "saldo": "1.166.970,00",
//       "type": "CR",
//       "amount": "100.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB JAMAL TO HESTI SEPTIYANI",
//       "saldo": "1.266.970,00",
//       "type": "CR",
//       "amount": "100.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB WISNU KUMBOYON TO HESTI SEPTIYANI",
//       "saldo": "1.316.970,00",
//       "type": "CR",
//       "amount": "50.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB JAMAL TO HESTI SEPTIYANI",
//       "saldo": "1.411.970,00",
//       "type": "CR",
//       "amount": "95.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB RAWANDI TO HESTI SEPTIYANI",
//       "saldo": "1.511.970,00",
//       "type": "CR",
//       "amount": "100.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB RIVALDI TO HESTI SEPTIYANI",
//       "saldo": "1.611.970,00",
//       "type": "CR",
//       "amount": "100.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB ARDIANA PUTRI TO HESTI SEPTIYANI",
//       "saldo": "1.631.970,00",
//       "type": "CR",
//       "amount": "20.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB FERI MULYANTO TO HESTI SEPTIYANI",
//       "saldo": "1.731.970,00",
//       "type": "CR",
//       "amount": "100.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB SAIPUL TO HESTI SEPTIYANI",
//       "saldo": "1.841.970,00",
//       "type": "CR",
//       "amount": "110.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB RIYANTO TO HESTI SEPTIYANI",
//       "saldo": "2.041.970,00",
//       "type": "CR",
//       "amount": "200.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB ADI FAUZI TO HESTI SEPTIYANI",
//       "saldo": "2.334.970,00",
//       "type": "CR",
//       "amount": "293.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER ATM VERONIKA SUYAT TO HESTI SEPTIYANI h",
//       "saldo": "2.384.970,00",
//       "type": "CR",
//       "amount": "50.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB RIO GUSPENDI TO HESTI SEPTIYANI",
//       "saldo": "2.424.970,00",
//       "type": "CR",
//       "amount": "40.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB SUPIRMAN TO HESTI SEPTIYANI",
//       "saldo": "2.524.970,00",
//       "type": "CR",
//       "amount": "100.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER ATM SAPRUDIN TO HESTI SEPTIYANI c",
//       "saldo": "2.624.969,00",
//       "type": "CR",
//       "amount": "99.999,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB ADI KURNIAWAN TO HESTI SEPTIYANI",
//       "saldo": "2.655.092,00",
//       "type": "CR",
//       "amount": "30.123,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB RIO HENDRA PAK TO HESTI SEPTIYANI",
//       "saldo": "2.855.092,00",
//       "type": "CR",
//       "amount": "200.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB ASEP TEDI TO HESTI SEPTIYANI",
//       "saldo": "3.005.098,00",
//       "type": "CR",
//       "amount": "150.006,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB JEFRIANTO BARA TO HESTI SEPTIYANI",
//       "saldo": "3.050.098,00",
//       "type": "CR",
//       "amount": "45.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB SILVESTER GABR TO HESTI SEPTIYANI",
//       "saldo": "3.075.098,00",
//       "type": "CR",
//       "amount": "25.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER ATM AGUS SUPRIYATM TO HESTI SEPTIYANI V",
//       "saldo": "3.285.098,00",
//       "type": "CR",
//       "amount": "210.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB RIO HENDRA PAK TO HESTI SEPTIYANI",
//       "saldo": "3.535.098,00",
//       "type": "CR",
//       "amount": "250.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "085641641903|106SMS|19/01/2023-22/01/202",
//       "saldo": "3.482.098,00",
//       "type": "DB",
//       "amount": "53.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB EFENDRI TO HESTI SEPTIYANI",
//       "saldo": "3.582.098,00",
//       "type": "CR",
//       "amount": "100.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB GANJAR TO HESTI SEPTIYANI",
//       "saldo": "3.632.098,00",
//       "type": "CR",
//       "amount": "50.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB AWAL HIDAYAT TO HESTI SEPTIYANI",
//       "saldo": "4.147.098,00",
//       "type": "CR",
//       "amount": "515.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER ATM AHMAD SANTINI TO HESTI SEPTIYANI y",
//       "saldo": "4.397.431,00",
//       "type": "CR",
//       "amount": "250.333,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB JEFRIANTO BARA TO HESTI SEPTIYANI",
//       "saldo": "4.449.431,00",
//       "type": "CR",
//       "amount": "52.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB BEDI TRI WINAR TO HESTI SEPTIYANI",
//       "saldo": "5.029.967,00",
//       "type": "CR",
//       "amount": "580.536,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER ATM NUR SIFAH INDR TO HESTI SEPTIYANI d",
//       "saldo": "5.154.967,00",
//       "type": "CR",
//       "amount": "125.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "WBNKSETOR#2063123084 304001022465536#786",
//       "saldo": "5.185.504,00",
//       "type": "CR",
//       "amount": "30.537,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB HESTI SEPTIYAN TO KOKO DEWANTO",
//       "saldo": "185.504,00",
//       "type": "DB",
//       "amount": "5.000.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB SADARHATI NDRU TO HESTI SEPTIYANI",
//       "saldo": "409.516,00",
//       "type": "CR",
//       "amount": "224.012,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB SAIPUL TO HESTI SEPTIYANI",
//       "saldo": "489.516,00",
//       "type": "CR",
//       "amount": "80.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB ROHMAN TO HESTI SEPTIYANI",
//       "saldo": "519.520,00",
//       "type": "CR",
//       "amount": "30.004,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB DILA WALET TO HESTI SEPTIYANI",
//       "saldo": "619.520,00",
//       "type": "CR",
//       "amount": "100.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB DENI IRWANTO TO HESTI SEPTIYANI",
//       "saldo": "719.520,00",
//       "type": "CR",
//       "amount": "100.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB I WAYAN SUPARS TO HESTI SEPTIYANI",
//       "saldo": "762.520,00",
//       "type": "CR",
//       "amount": "43.000,00"
//     },
//     {
//       "tanggal": "25/01/23",
//       "transaksi": "TRANSFER NBMB STEPANUS JAMAL TO HESTI SEPTIYANI",
//       "saldo": "862.520,00",
//       "type": "CR",
//       "amount": "100.000,00"
//     }
// ]

const db = require("./libraries/db");
(async() => {
  const ma = await db.getMacaddres({
    username: "dsdad",
    situs: "danatogel",
    macaddres: "00:ff:bf:1a:56:fd"
});
console.log(ma);
})()