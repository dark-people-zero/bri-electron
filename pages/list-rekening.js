window.$ = window.jQuery = require("jquery");
const { ipcRenderer } = require('electron');
const path = require('path');
const GoogleSheet = require("../libraries/googleSheet");
const keyFile = path.join(__dirname, "../libraries/credentials.json");

var dataRekening = ipcRenderer.sendSync("get-list-rekening");
var sessionAccount = {};
var tableRekening = $("#tableRekening");
ajaxProxy.init();
var checkAccount = false;

ipcRenderer.send("getRekening");
ipcRenderer.on("getRekening", (e, res) => {
    if (res.status) {
        var arrOld = dataRekening.map(e => e.username);
        res.data.forEach(item => {
            if (arrOld.includes(item.username)) {
                var i = dataRekening.findIndex(e => e.username == item.username);
                dataRekening[i].password = item.password;
                dataRekening[i].norek = item.norek;
            }else{
                dataRekening.push(item);
            }
        });
        ipcRenderer.send("put-list-rekening", dataRekening);
        setTable(dataRekening);
    }else{
        Swal.fire({
            title: 'Opsss...!',
            text: res.message,
            icon: 'error',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oke bosss',
        }).then((result) => {
            ipcRenderer.send("close");
        })
    }
})

ipcRenderer.send("checkAccount");
ipcRenderer.on("checkAccount", (e, res) => {
    if (res.status) {
        sessionAccount = res.data;
        $('.nav-profile .name').text(sessionAccount.email);
        $('.nav-profile .situs').text(sessionAccount.situs);
        console.log(sessionAccount);
        if (sessionAccount.admin) {
            $("#dataMacAddress").removeClass("d-none");
        }else{
            $("#dataMacAddress").addClass("d-none");
        }
        checkAccount = true;
        if (dataRekening.length > 0 && checkAccount) $(".loading").removeClass("show");
    }else{
        Swal.fire({
            title: 'Opsssss....?',
            text: res.message,
            icon: 'info',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'OK',
        }).then((result) => {
            if (result.isConfirmed) {
                ipcRenderer.send("logout");
            }
        })
    }
})

var robotStandBy = [];
var robotRunning = [];
var robotInterval = {};

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})

$('.nav-group').click(function() {
    var target = $(this).attr('data-target');
    if(!$(this).hasClass('active') && target != undefined && robotStandBy.length == 0) {
        $(this).parent().find('.active').removeClass('active');
        $(this).addClass('active');
        $(target).collapse('show');

        if (target == "#formRekening") {
            $("#formGlobal").trigger("reset");
            $('#formGlobal input[name="method"]').val("post");
            $('.btn-title').text("Simpan");
        }
    }
})

$('.close').click(() => {
    if (robotStandBy.length == 0) {
        Swal.fire({
            title: 'Apakah anda yakin?',
            text: "Ingin keluar dari aplikasi.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Iya, Yakin.',
            cancelButtonText: 'Ehhh, Gak jadi deh..'
        }).then((result) => {
            if (result.isConfirmed) {
                $('.loading').addClass('show');
                ipcRenderer.send("close");
            }
        })
    }else{
        Swal.fire(
            'Opsss...!',
            'Tunggu bos, masih ada robot yang masih running',
            'info'
        )
    }
});

$('.minimize').click(() => ipcRenderer.send("minimize"));

$(".fullscreen").click(function() {
    if($(this).hasClass('show')) {
        $(this).removeClass('show');
        $(this).text("fullscreen");
    }else{
        $(this).addClass('show');
        $(this).text("fullscreen_exit");
    }
    ipcRenderer.send("fullscreen")
})

$("#btn-logout").click(function() {
    if (robotStandBy.length == 0) {
        Swal.fire({
            title: 'Apakah anda yakin?',
            text: "Ingin keluar dari account ini.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Iya, Yakin.',
            cancelButtonText: 'Ehhh, Gak jadi deh..'
        }).then((result) => {
            if (result.isConfirmed) {
                $('.loading').addClass('show');
                ipcRenderer.send("logout");
            }
        })
    }else{
        Swal.fire(
            'Opsss...!',
            'Tunggu bos, masih ada robot yang masih running',
            'info'
        )
    }
})

$(".search-main .icon").click(function() {
    var val = $('.search-main input').val();
    var disabled = $('.search-main input').prop("disabled");
    if (!disabled) {
        if($(this).hasClass('clear')) {
            $(this).removeClass('clear');
            $(this).text("search");
            $(this).parent().find('input').val('');
            $(this).parent().find('input').focus();
        }else{
            if(val != "") {
                $(this).addClass('clear');
                $(this).text("close");
            }else{
                $(this).parent().find('input').focus()
            }
        }
        $(this).parent().find('input').trigger('change');
    }
})

$('.search-main input').keyup(function() {
    $(this).trigger('change');
})

$('.search-main input').change(function() {
    var val = $(this).val();
    if (val != "") {
        $(this).parent().find('.icon').addClass('clear');
        $(this).parent().find('.icon').text("close");
        var newData = dataRekening.filter(e => {
            return e.username.includes(val) || e.password.includes(val) || e.norek.includes(val);
        });

        setTable(newData);
    }else{
        $(this).parent().find('.icon').removeClass('clear');
        $(this).parent().find('.icon').text("search");
        setTable(dataRekening);
    }
})

$("#checkboxProxy").change(function() {
    var prop = $(this).prop("checked");
    $('input[name="proxyIp"]').attr('required', prop);
    $('input[name="proxyUsername"]').attr('required', prop);
    $('input[name="proxyPassword"]').attr('required', prop);
})

$("#checkboxGoogleSheet").change(function() {
    var prop = $(this).prop("checked");
    $('input[name="spreadsheetId"]').attr('required', prop);
    $('input[name="range"]').attr('required', prop);
})

$("#formGlobal").submit(async function(e) {
    e.preventDefault();
    $(".loading").addClass('show');
    var form = $(this).serializeArray().reduce((a,b) => {
        a[b.name] = b.value;
        return a;
    }, {})

    form.username = $('input[name="username"]').val();
    form.password = $('input[name="password"]').val();
    form.norek = $('input[name="norek"]').val();

    form.proxyStatus = form.proxyStatus == undefined ? false : true;
    form.statusGoogleSheet = form.statusGoogleSheet == undefined ? false : true;
    form.showBrowser = form.showBrowser == undefined ? false : true;

    if (form.proxyStatus) {
        ajaxProxy.proxy.url = form.proxyIp;
        ajaxProxy.proxy.credentials.username = form.proxyUsername;
        ajaxProxy.proxy.credentials.password = form.proxyPassword;
        var hasilChek = null;
        await $.ajax({
            type: "GET",
            url: "http://checkip.amazonaws.com/",
            headers: ajaxProxy.proxyHeaders(),
            dataType: "text"
        }).done(function(data) {
            hasilChek = data;
        }).fail(function(err) {
            $(".loading").removeClass('show');
            Toast.fire({
                icon: 'error',
                title: 'Error',
                text: 'Data proxy yang anda masukkan salah, silahkan coba chek dengan teliti bos...'
            })
        })

        if (hasilChek) {
            var ip = form.proxyIp.replaceAll("http://", "").replaceAll("https://", "").split(":")[0];
            if (!hasilChek.includes(ip)) {
                $(".loading").removeClass('show');
                Toast.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Data proxy yang anda masukkan salah, silahkan coba chek dengan teliti bos...'
                })
                return false;
            }
        }
    }

    if (form.statusGoogleSheet) {
        try {
            var googleSheet = new GoogleSheet({
                keyFile: keyFile,
                spreadsheetId: form.spreadsheetId,
                range: form.range,
                keys: ["tanggal","transaksi","debet","kredit","saldo"],
            });
    
            var check = await googleSheet.getAll();
        } catch (error) {
            $(".loading").removeClass('show');
            Toast.fire({
                icon: 'error',
                title: 'Error',
                text: 'Data google sheet yang anda masukkan salah, silahkan coba chek dengan teliti bos...'
            })
            return false;
        }
    }
    
    var method = form.method;
    if (form.method == "post") {
        form.status = false;
        delete form.method;
        dataRekening.push(form);
        setTable(dataRekening);
    }else{
        var index = dataRekening.findIndex(e => e.username == form.method);
        delete form.method;
        form.status = dataRekening[index].status;
        dataRekening[index] = form;
        $(`#${form.username}`).find('.interval').text(form.interval+"s");
        $(`#${form.username}`).find('.statusProxy').prop("checked", form.proxyStatus);
        $(".loading").removeClass("show");
    }
    ipcRenderer.send("put-list-rekening", dataRekening);
    $(".kembali").click();
    Toast.fire({
        icon: 'success',
        title: 'Info',
        text: 'Data berhasil di '+(method == "post" ? 'tambahkan.' : 'ubah.')
    })
})

$("#startAndStopRobot").click(function() {
    var stat = $(this).hasClass("on");
    if (stat) {
        if (robotRunning.length == 0) {
            Swal.fire({
                title: 'Apakah anda yakin?',
                text: "Mau menghentikan robot ?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Iya, Yakin.',
                cancelButtonText: 'Ehhh, Gak jadi deh..'
            }).then((result) => {
                if (result.isConfirmed) {
                    robotStandBy.forEach(item => {
                        clearInterval(robotInterval[item]);
                        delete robotInterval[item];
                        robot.logoutBank(item);
                    });
                }
            })
        }else{
            Swal.fire(
                'Opsss...!',
                'Tunggu bos, masih ada robot yang masih running',
                'info'
            )
        }
    }else{
        $('.search-main input').val('').trigger('change');
        $('[data-target="#listRek"]').click();
        var data = dataRekening.filter(e => e.status);
        data.forEach(item => robot.start(item));
    }
})

$(".kembali").click(() => {
    $("#listRek").collapse('show');
    $('.nav-left .nav-group').removeClass('active');
    $('[data-target="#listRek"]').addClass("active");
    $(".search-main").val("").trigger("change").show();
})

function setTable(data) {
    if (dataRekening.length > 0 && checkAccount) $(".loading").removeClass("show");
    if (data.length > 0) {
        tableRekening.find("tbody").children().remove();
        data.forEach((val,i) => {
            var tr = $(`
                <tr class="text-center" id="${val.username}">
                    <td class="align-middle">${i+1}</td>
                    <td class="align-middle">${val.username}</td>
                    <td class="align-middle">${val.password}</td>
                    <td class="align-middle">${val.norek}</td>
                    <td class="align-middle interval">${val.interval}s</td>
                    <td class="text-center align-middle">
                        <div class="form-check d-flex justify-content-center">
                            <input class="form-check-input changeStatus" type="checkbox" id="checkBoxStatus${i}" ${val.status ? 'checked' : ''} data-username="${val.username}">
                            <label class="form-check-label" for="checkBoxStatus${i}"></label>
                        </div>
                    </td>
                    <td class="text-center align-middle">
                        <div class="form-check d-flex justify-content-center">
                            <input class="form-check-input statusProxy" type="checkbox" id="checkBox${i}" disabled ${val.proxyStatus ? 'checked' : ''}>
                            <label class="form-check-label" for="checkBox${i}"></label>
                        </div>
                    </td>
                    <td class="text-center align-middle">
                        <div class="form-check d-flex justify-content-center">
                            <input class="form-check-input statusGSheet" type="checkbox" id="statusGoogleSheet${i}" disabled ${val.statusGoogleSheet ? 'checked' : ''}>
                            <label class="form-check-label" for="statusGoogleSheet${i}"></label>
                        </div>
                    </td>
                    <td class="align-middle">
                        <div class="d-flex border-start-0 align-items-center justify-content-center">
                            <div class="playStop-mutasi d-flex align-items-center me-2 ${val.status ? '' : 'd-none'}" type="button" data-username="${val.username}">
                                <span class="material-symbols-outlined text-success">play_circle</span>
                            </div>
                            <div class="update-mutasi text-info me-2 d-flex align-items-center action-table" type="button" data-username="${val.username}">
                                <span class="material-symbols-outlined">edit</span>
                            </div>
                            <div class="delete-mutasi text-danger d-flex align-items-center action-table" type="button" data-username="${val.username}">
                                <span class="material-symbols-outlined text-danger">delete</span>
                            </div>
                        </div>
                    </td>
                    <td class="keterangan-table fw-bold align-middle" data-username="${val.username}">
                        <span class="badge text-bg-warning text-wrap">Offline</span>
                    </td>
                </tr>
            `)

            tr.find(".changeStatus").change(function() {
                $(".loading").addClass("show");
                var prop = $(this).prop("checked");
                var username = $(this).data("username");
                dataRekening = dataRekening.map(e => {
                    if (e.username == username) e.status = prop;
                    return e;
                });
                tr.find(`.playStop-mutasi[data-username="${username}"]`).toggleClass("d-none");
                ipcRenderer.send("put-list-rekening", dataRekening);
                $(".loading").removeClass("show");
            })

            tr.find(".update-mutasi").click(function() {
                var username = $(this).data("username");
                var data = dataRekening.find(e => e.username == username);
                $('input[name="method"]').val(username);
                $('.btn-title').text("Update");

                $('input[name="username"]').val(data.username);
                $('input[name="password"]').val(data.password);
                $('input[name="norek"]').val(data.norek);
                $('input[name="interval"]').val(data.interval);
                $('input[name="proxyStatus"]').prop("checked", data.proxyStatus);
                $('input[name="proxyIp"]').val(data.proxyIp);
                $('input[name="proxyUsername"]').val(data.proxyUsername);
                $('input[name="proxyPassword"]').val(data.proxyPassword);
                $('input[name="statusGoogleSheet"]').prop("checked", data.statusGoogleSheet)
                $('input[name="spreadsheetId"]').val(data.spreadsheetId);
                $('input[name="range"]').val(data.range);

                $('input[name="showBrowser"]').prop("checked", data.showBrowser ? data.showBrowser : false);
                var typeBrowser = data.typeBrowser ? data.typeBrowser : "chromium";
                $('input[name="typeBrowser"]').val(typeBrowser);
                $('.dropdown-item').removeClass('selected');
                var targetTypeBrowser = $(`.dropdown-item[data-value="${typeBrowser}"]`);
                targetTypeBrowser.addClass('selected');
                var text = targetTypeBrowser.text();
                var img = targetTypeBrowser.parent().find('.icon').attr("src");
                targetTypeBrowser.closest('.form-group').find('[data-bs-toggle="dropdown"]').text(text);
                targetTypeBrowser.closest('.form-group').find('.icon-default').attr('src', img);
                
                $("#formRekening").collapse('show');
                $(".search-main").val("").trigger("change").hide();
            })

            tr.find(".delete-mutasi").click(function() {
                var username = $(this).data("username");
                Swal.fire({
                    title: 'Apakah anda yakin?',
                    text: "Mau menghapus data rekening "+ username,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Iya, Delete aja.',
                    cancelButtonText: 'Ehhh, Gak jadi deh..'
                }).then((result) => {
                    if (result.isConfirmed) {
                        dataRekening = dataRekening.filter(e => e.username != username);
                        setTable(dataRekening);
                        ipcRenderer.send("put-list-rekening", dataRekening);
                        Swal.fire(
                            'Deleted!',
                            'Rekening '+ username + ' berhasil di hapus.',
                            'success'
                        )
                    }
                })
                
            })

            tr.find(".playStop-mutasi").click(function() {
                var username = $(this).data("username");
                var stat = $(this).hasClass('on');
                var data = dataRekening.find(e => e.username == username);
                if (!robotRunning.includes(username)) {
                    if (stat) {
                        Swal.fire({
                            title: 'Apakah anda yakin?',
                            text: "Mau menghentikan robot "+ username,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Iya, Yakin.',
                            cancelButtonText: 'Ehhh, Gak jadi deh..'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                clearInterval(robotInterval[username]);
                                delete robotInterval[username];
                                robot.logoutBank(username);
                            }
                        })
                    }else{
                        robot.start(data);
                    }
                }
            })

            tableRekening.find("tbody").append(tr);
        });
    }else{
        tableRekening.find("tbody").children().remove();
        var tr = $(`
            <tr>
                <td colspan="10" class="text-center">Belum ada data rekening / data rekening tidak di temukan</td>
            </tr>
        `)
        tableRekening.find("tbody").append(tr)
    }
}

ipcRenderer.on("change-status", (e, data) => {
    var html = `<span class="badge text-bg-${data.error ? 'danger' : 'success'} text-wrap">${data.message}</span>`;
    $(`.keterangan-table[data-username="${data.username}"]`).html(html);
    if (data.error) {
        setTimeout(() => {
            var dt = dataRekening.find(e => e.username == data.username);
            robot.stop(dt, false);
        }, 1000);
    }

    if (data.runInterval) robot.runInterval(data);
})

const robot = {
    start: (data) => {
        if (robotStandBy.length == 0) {
            $('.search-main input').attr("disabled", true);
            $("#startAndStopRobot").attr('class', 'nav-group bg-warning');
            $("#startAndStopRobot").find('.material-symbols-outlined').text("stop_circle");
            $("#startAndStopRobot").find('.nav-item-title').text("Stop Robot");
            $("#startAndStopRobot").addClass('on');
        }

        $(`.changeStatus[data-username="${data.username}"]`).attr("disabled", true);
        $(`.action-table[data-username="${data.username}"]`).addClass('d-none');
        var ps = $(`.playStop-mutasi[data-username="${data.username}"]`);
        ps.addClass("on");
        ps.addClass('spin');
        ps.find('.material-symbols-outlined').removeClass('text-success').removeClass('text-warning').addClass('text-info');
        ps.find('.material-symbols-outlined').text('cached');
        
        $(`.keterangan-table[data-username="${data.username}"]`).html('<span class="badge text-bg-success">Sedang membuat browser.</span>');
        robotStandBy.push(data.username);
        robotRunning.push(data.username);

        ipcRenderer.send("play-mutasi", data);
    },
    stop: (data, changeKet = true) => {
        robotStandBy = robotStandBy.filter(e => e != data.username);
        robotRunning = robotRunning.filter(e => e != data.username);

        if (robotStandBy.length == 0) {
            $('.search-main input').attr("disabled", false);
            $("#startAndStopRobot").attr('class', 'nav-group bg-success');
            $("#startAndStopRobot").find('.material-symbols-outlined').text("play_circle");
            $("#startAndStopRobot").find('.nav-item-title').text("Start Robot");
            $("#startAndStopRobot").removeClass('on');
        }

        $(`.changeStatus[data-username="${data.username}"]`).attr("disabled", false);
        $(`.action-table[data-username="${data.username}"]`).removeClass('d-none');
        var ps = $(`.playStop-mutasi[data-username="${data.username}"]`);
        ps.removeClass("on");
        ps.removeClass("spin");
        ps.find('.material-symbols-outlined').removeClass('text-warning').removeClass('text-info').addClass('text-success');
        ps.find('.material-symbols-outlined').text('play_circle');
        
        if(changeKet) $(`.keterangan-table[data-username="${data.username}"]`).html('<span class="badge text-bg-warning">Offline</span>');
        
        ipcRenderer.send("stop-mutasi", data);
    },
    runInterval: (data) => {
        robotRunning = robotRunning.filter(e => e != data.username);
        var bank = dataRekening.find(e => e.username == data.username);
        var ps = $(`.playStop-mutasi[data-username="${data.username}"]`);
        ps.removeClass("spin");
        ps.find('.material-symbols-outlined').removeClass('text-success').removeClass('text-info').addClass('text-warning');
        ps.find('.material-symbols-outlined').text('stop_circle');
        var interval = bank.interval;
        $(`.keterangan-table[data-username="${data.username}"]`).html('<span class="badge text-bg-success">'+interval+'s</span>');
        robotInterval[data.username] = setInterval(() => {
            if (interval == 0) {
                clearInterval(robotInterval[data.username]);
                delete robotInterval[data.username];
                robotRunning.push(data.username);
                ps.addClass("on");
                ps.addClass('spin');
                ps.find('.material-symbols-outlined').removeClass('text-success').removeClass('text-warning').addClass('text-info');
                ps.find('.material-symbols-outlined').text('cached');
                $(`.keterangan-table[data-username="${data.username}"]`).html('<span class="badge text-bg-success">Sedang ambil data saldo</span>');
                ipcRenderer.send("getSaldoMutasi", bank);
            }else{
                interval -= 1;
                $(`.keterangan-table[data-username="${data.username}"]`).html('<span class="badge text-bg-success">'+interval+'s</span>');
            }
        }, 1000);
    },
    logoutBank: (username) => {
        robotRunning.push(username);
        var ps = $(`.playStop-mutasi[data-username="${username}"]`);
        ps.addClass("on");
        ps.addClass('spin');
        ps.find('.material-symbols-outlined').removeClass('text-success').removeClass('text-warning').addClass('text-info');
        ps.find('.material-symbols-outlined').text('cached');
        ipcRenderer.send("logoutBank", username);
    }
}

$("#reloadList").click(() => {
    if (robotStandBy.length == 0) {
        $(".loading").addClass("show");
        ipcRenderer.send("getRekening");
    }else{
        Swal.fire(
            'Opsss...!',
            'Tunggu bos, masih ada robot yang masih running',
            'info'
        )
    }
});

$(".dropdown .dropdown-menu .dropdown-item").click(function() {
    var value = $(this).data("value");
    var img = $(this).parent().find('img').attr('src');
    $(this).closest('.dropdown-menu').find('.selected').removeClass('selected');
    $(this).addClass('selected');
    $(this).closest('.dropdown').find('[data-bs-toggle="dropdown"]').text($(this).text());
    $(this).closest('.form-group').find('input').val(value);
    $(this).closest('.form-group').find('.icon-default').attr('src', img);
})

const ps = new PerfectScrollbar('#content', {
    wheelSpeed: 2,
    wheelPropagation: true,
    minScrollbarLength: 20
});

$("#dataMacAddress").click(e => {
    $('.loading').addClass("show");
    ipcRenderer.send("showMacAddress");
})