const { ipcRenderer } = require('electron');
const moment = require("moment");
moment.locale('id');
var dataRekening = ipcRenderer.sendSync("active-list-rekening");
document.addEventListener("DOMContentLoaded", () => {
    window.$ = window.jQuery = require("jquery");
    console.log("loaded");
    func.init();
})

const func = {
    init: () => {
        if (document.body.textContent.includes('Login')) {
            func.login();
        }
    },
    login: () => {
        setTimeout(() => {
            $('input[placeholder="user ID"]').val(dataRekening.username);
            $('input[placeholder="username"]').val(dataRekening.username);
            $('input[placeholder="password"]').val(dataRekening.password);
            $('input[placeholder="validation"]').focus();
        }, 1000);
    }
}

var statusRobot = false;
var interValRobot, intTime;
var time = dataRekening.interval;

// document.querySelector('button[type="submit"]').click()

ipcRenderer.on("reload", (e) => {
    window.location.reload();
})

ipcRenderer.on("start", (e) => {
    prosesInterval();
})

ipcRenderer.on("stop", (e) => {
    statusRobot = false;
    clearTimeout(interValRobot);
    clearInterval(intTime);
})

function prosesInterval() {
    if (!statusRobot) {
        statusRobot = true;
        var span = $(`<span class="time">${time}</span>`);
        span.css("margin-left", "20px");
        span.css("font-size", "20px");
        span.css("font-weight", "bold");
        span.css("color", "#fff");
        intTime = setInterval(() => {
            time = time - 1;
            console.log(time);
            $('.logoib').find('.time').text(time);
        }, 1000);
        $('.logoib').append(span);
        interValRobot = setTimeout(() => {
            time = dataRekening.interval;
            clearInterval(intTime);
            $('.logoib').find('.time').remove();
            statusRobot = false;
            funProses();
        }, dataRekening.interval*1000);
    }
}

function funProses() {
    var menu = document.getElementById('iframemenu');
    var content = document.getElementById('content');
    menu.contentDocument.querySelector('a[href="BalanceInquiry.html"]').click();
    setTimeout(() => {
        if (content.contentDocument.body.textContent.includes('Sesion Anda telah habis')) {
            content.contentDocument.querySelector('input[name="closeButton"]').click();
        }else{
            var date = document.querySelector('#clockbox').textContent;
            var table = content.contentDocument.querySelector("#tabel-saldo");
            var td = table.querySelectorAll('tbody tr td');
            td = [...td].map((e) => e.textContent);
            ipcRenderer.send("update-saldo", {
                rek: dataRekening,
                data: td,
                date: moment(date, 'dddd, DD MMMM YYYY hh:mm:ss').format("YYYY-MM-DD")
            });
            setTimeout(() => {
                menu.contentDocument.querySelector('a[href="AccountStatement.html"]').click();
                setTimeout(() => {
                    content.contentDocument.querySelector('#ACCOUNT_NO').value = dataRekening.norek;
                    content.contentDocument.querySelector('input[value="Download"]').click();
                }, 2000);
            }, 2000);
        }
    }, 1000);
}