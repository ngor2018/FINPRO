$(function () {
    $('.select_').select2()
    $("#clickUpload").click(function () {
        document.getElementById('profileUpload').click();
    })
    $("#resetImg").click(function () {
        $("#profilePic").attr("src", "../images/user.png");
        $("#error_img").html('');
    })
    document.getElementById("profileUpload").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file && (file.size <= 100 * 1024)) { //100 Ko
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById("profilePic").src = e.target.result;
            };
            reader.readAsDataURL(file);
            document.getElementById('error_img').textContent = "";
        } else {
            var message = 'La taille du fichier ne doit pas dépasser 100 Ko.';
            document.getElementById('error_img').textContent = message;
            event.target.value = "";
        }
    });
    $('.closeForm').click(function () {
        document.getElementById('fullscreen_popup').style.display = "none";
    })
})
var Imprimer = function () {
    document.getElementById('fullscreen_popup').style.display = "block";
}