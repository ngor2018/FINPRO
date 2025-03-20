$(function () {
    $("#clickUpload").click(function () {
        document.getElementById('profileUpload').click();
    })
    document.getElementById("profileUpload").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById("profilePic").src = e.target.result;
            };
            if (file.size > 100 * 1024) {
                alert('La taille du fichier ne doit pas dépasser 100 Ko.');
                event.target.value = '';
            } else {
                reader.readAsDataURL(file);
            }
        }
    });
})