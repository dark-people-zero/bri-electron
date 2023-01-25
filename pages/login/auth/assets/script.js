$("#situs").SumoSelect({
    placeholder: "Silahkan pilih situs",
    search: true,
    searchText: "Cari situs...",
    noMatch: 'Tidak ditemukan untuk "{0}"'
})
$("#situs").on("sumo:opening", function() {
    $(".err-situs").addClass('d-none');
})

ipc.send("get-situs");
ipc.on("get-situs", (e, res) => {
    $(".loading").removeClass('show');
    if (res.status) {
        res.data.filter(e => e.site_is_active.toLocaleLowerCase() == "y" ).forEach(item => {
            $('#situs')[0].sumo.add(item.site_code,item.site_title);
        });
    }else{
        console.log(res);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!',
        })
    }
})

ipc.on("error-login", (e, message) => {
    $('.loading').removeClass('show');
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message,
    })
})

const ps = new
    PerfectScrollbar('.SumoSelect .optWrapper ul.options', {
    wheelSpeed: 2,
    wheelPropagation: true,
    minScrollbarLength: 20
});

$('.close').click(() => {
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
            ipc.send("close")
        }
    })
});

$('.minimize').click(() => ipc.send("minimize"));
    
$(".fullscreen").click(function() {
    if($(this).hasClass('show')) {
        $(this).removeClass('show');
        $(this).text("fullscreen");
    }else{
        $(this).addClass('show');
        $(this).text("fullscreen_exit");
    }
    ipc.send("fullscreen");
})

$(".btn-pass").click(function() {
    var stat = $(this).hasClass('show');
    if (stat) {
        $(this).removeClass('show');
        $(this).text("visibility");
        $(this).parent().find('input').attr('type', 'password');
    }else{
        $(this).addClass('show');
        $(this).text("visibility_off");
        $(this).parent().find('input').attr('type', 'text');
    }
})

var firebaseConfig = {
    apiKey: "AIzaSyAc2rQEf2fx_FXR7DYLMkHUcTdkz1Ra8tw",
    authDomain: "augipt-social.firebaseapp.com",
    databaseURL: "https://augipt-social.firebaseio.com",
    projectId: "augipt-social",
    storageBucket: "augipt-social.appspot.com",
    messagingSenderId: "1048845974504"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let provider = new firebase.auth.GoogleAuthProvider();

function login() {
    $('.loading').addClass('show');
    var idsitus = $('#situs').val();
    if (idsitus == 0) {
        $('.loading').removeClass('show');
        $(".err-situs").removeClass('d-none');
        return false;
    }else{
        firebase.auth().signInWithPopup(provider).then(res => {
            var dataLogin = {
                type: "google",
                username: res.user.email,
                password: res.user.uid,
                situs: idsitus
            }
            ipc.send("login", dataLogin);
        }).catch(e => {
            var msg = e.message;
            $('.loading').removeClass('show');
            if (!msg.includes('closed by the user')) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: msg,
                })
            }
        })
    }
    
}

function logout() {
    firebase.auth().signOut();
}

document.getElementById('loginGoogle').addEventListener('click', login);

$("#formLogin").submit(function(e) {
    e.preventDefault();
    $('.loading').addClass('show');
    var dataLogin = {
        type: "local",
        username: $(this).find('input[name="username"]').val(),
        password: $(this).find('input[name="password"]').val(),
        situs: $('#situs').val()
    }
    ipc.send("login", dataLogin);
})

