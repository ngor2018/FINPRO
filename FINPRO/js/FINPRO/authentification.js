$(document).ready(function () {
    $('.rectif').keyup(function () {
        document.getElementById('erreur').textContent = "";
    })
    var Multiproj = $("#Multiproj").val();
    switch (Multiproj) {
        case "1":
            toggleForms("saisirMultiProj");
            break;
        case "0":
            var versionSql = $("#versionSql").val();
            var NomServeur = $("#NomServeur").val();
            var NomBase = $("#NomBase").val();
            var sql = NomServeur + " (" + versionSql + " - " + NomBase + ")";
            $("#infoBDD").html(sql);
            toggleForms("saisirConnexion");
            break;
        default:
            toggleForms("ErreurBase");
            break;
    }
    $("#login").focus();
    $("#rafraichir").click(function () {
        window.location.reload();
    })
    $("#password").click(function () {
        password();
    })
    $("#password").keyup(function () {
        password();
    })
    $("#AllProjets").click(function () {
        document.getElementById('saisirConnexion').style.display = "none";
        document.getElementById('saisirMultiProj').style.display = "block";
    })
    document.getElementById('CreerProj').addEventListener('click', function () {
        const button = document.getElementById('CreerProj');
        const buttonText = button.textContent.trim();
        if (buttonText.startsWith('Cr')) {
            enableOneClick();
            disableDblClick();
            reset();
            this.textContent = 'Connexion sur un Projet';
            document.getElementById('addProjet').style.display = "block";
        } else
            if (buttonText.startsWith('Co')) {
                enableDblClick();
                this.textContent = 'Créer Projet(s)';
                document.getElementById('addProjet').style.display = "none";
            }
    });
    enableDblClick();
    $("#ajouter_").click(function () {
        setTimeout(function () {
            $("#nomBDD_").focus();
        }, 500)
        document.getElementById('ajouter_').disabled = true;
        document.getElementById('annuler_').disabled = false;
        document.getElementById('Enregistrer_').disabled = false;
        //document.getElementById('SaisieCheck').style.display = "block";

        $("#nomBDD_").val('');
        $("#sigle_").val('');
        $("#libelle_").val('');
        document.getElementById('nomBDD_').disabled = false;
        document.getElementById('sigle_').disabled = false;
        document.getElementById('libelle_').disabled = false;
        document.getElementById('flexCheckDefault').disabled = false;

        document.getElementById('flexCheckDefault').checked = false;
        document.getElementById('pencilButton').disabled = false;
        document.getElementById('hddButton').disabled = true;
    })
    $("#annuler_").click(function () {
        reset();
    })
    $("#SeConnecter").click(function () {
        var isAllValid = true;
        var login = $("#login").val().trim();
        var password = $("#password").val().trim();
        var Confirmpassword = $("#Confirmpassword").val().trim();
        var codeMultiBase = $("#hiddenId").val();
        var NomServeur = $("#NomServeur").val();
        var NomBase = $("#NomBase").val();
        var NomUser = $("#NomUser").val();
        var passWordBdd = $("#passWordBdd").val();
        const form = document.getElementById('divConfirmPWD');
        const currentDisplay = window.getComputedStyle(form).display;
        switch (currentDisplay) {
            case "none":
                if (!login || !password) {
                    isAllValid = false;
                    document.getElementById('erreur_authentif').textContent = "Tous les champs doivent être remplis.";
                }
                break;
            case "block":
                if (!login || !password || !Confirmpassword) {
                    isAllValid = false;
                    document.getElementById('erreur_authentif').textContent = "Tous les champs doivent être remplis.";
                }
                // Vérification des critères de mot de passe
                // Au moins un chiffre, une majuscule, et 6 caractères
                var passwordPattern = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
                if (!passwordPattern.test(password)) {
                    document.getElementById('erreur_authentif').textContent = "Au moins 6 caractères(une majuscule, et un chiffre compris)";
                    isAllValid = false;
                }
                if (password !== Confirmpassword) {
                    isAllValid = false;
                    document.getElementById('erreur_authentif').textContent = "Les nouveaux mots de passe ne correspondent pas !";
                }
                break;
        }
        if (isAllValid) {
            const objData = {
                login: login,
                password: password,
                nomServeur: NomServeur,
                nomBase: NomBase,
                nomUtilisateur: NomUser,
                motDePasse: passWordBdd
            }
            $.ajax({
                url: "/Home/login",
                type: "POST",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(objData),
                success: function (data) {
                    switch (data.statut) {
                        case true:
                            window.location.href = '/Home/account';
                            break;
                        default:
                            $("#erreur_authentif").hide().html(data.message).fadeIn('slow');
                            break;
                    }
                }
            })
        }
    })
})
var Connexion = function () {
    

}
function password() {
    var login = $("#login").val();
    var NomServeur = $("#NomServeur").val();
    var NomBase = $("#NomBase").val();
    var NomUser = $("#NomUser").val();
    var passWordBdd = $("#passWordBdd").val();
    if (login.trim() != '') {
        const objData = {
            login: login,
            nomServeur: NomServeur,
            nomBase: NomBase,
            nomUtilisateur: NomUser,
            motDePasse: passWordBdd,
        }
        $.ajax({
            url: "/Home/checkLoginPasswod",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(objData),
            success: function (data) {
                switch (data.statut) {
                    case 1:
                        document.getElementById('divConfirmPWD').style.display = "block";
                        break;
                    case 2:
                        document.getElementById('divConfirmPWD').style.display = "none";
                        break;
                    default:
                        document.getElementById('divConfirmPWD').style.display = "none";
                        break;
                }
            },
            error: function (error) {
                alert("Erreur lors de l'envoi des données.");
                console.error(error);
            }
        });
    } else {
        document.getElementById('divConfirmPWD').style.display = "none";
        $("#Confirmpassword").val('');
    }
}
function enableOneClick() {
    $("#tbodyBase").on("click", "tr", function () {
        $(this).toggleClass("selected").siblings(".selected").removeClass("selected");
        document.getElementById("hiddenId").value = this.cells[0].innerHTML;
        var cellsID = this.rowIndex;
        $("#cellsID").val(cellsID);


        const numEnreg = this.cells[0].innerHTML;
        const nomServeur = this.cells[4].innerHTML;
        const nomUtilisateur = this.cells[6].innerHTML;
        const motdePasse = this.cells[7].innerHTML;
        const nomBase = this.cells[5].innerHTML;
        const sigle = this.cells[1].innerHTML;
        const libelle = this.cells[2].innerHTML;
        const statut = this.cells[8].innerHTML;
        const typeBase = this.cells[3].innerHTML;
        $("#numEnreg").val(numEnreg);
        $("#nomServeur_").val(nomServeur);
        $("#nomUser_").val(nomUtilisateur);
        $("#nompassword_").val(motdePasse);
        $("#nomBDD_").val(nomBase);
        $("#sigle_").val(sigle);
        $("#libelle_").val(libelle);
        if (statut == "True") {
            document.getElementById('flexCheckDefault').checked = true;
        } else {
            document.getElementById('flexCheckDefault').checked = false;
        }
        if (typeBase == "SQL") {
            document.getElementById('labelNameBdd').textContent = "Nom de la Base";
        } else {
            document.getElementById('labelNameBdd').textContent = "Service Oracle";
        }
    });
}
function enableDblClick() {
    //console.log("Double-clic activé sur la ligne : " + $(this).text());
    $("#tbodyBase").on("dblclick", "tr", function () {
        $(this).toggleClass("selected").siblings(".selected").removeClass("selected");
        document.getElementById("hiddenId").value = this.cells[0].innerHTML;
        var cellsID = this.rowIndex;
        $("#cellsID").val(cellsID);
        //Edit(this.cells[0].innerHTML);
        toggleForms("saisirConnexion");
        var NomServeur = this.cells[4].innerHTML;
        var NomBase = this.cells[5].innerHTML;
        var versionSql = $("#versionSql").val();
        var sql = NomServeur + " (" + versionSql + " - " + NomBase + ")";
        $("#infoBDD").html(sql);
        $("#NomBase").val(this.cells[5].innerHTML);
    });
}
// Désactiver le double-clic
function disableDblClick() {
    $("#tbodyBase").off("dblclick", "tr");
    //console.log("Double-clic désactivé sur les lignes du tableau.");
}
function toggleForms(showId) {
    // Liste des IDs des formulaires
    let forms = ["ErreurBase", "saisirConnexion", "saisirMultiProj"];

    forms.forEach(id => {
        let elem = document.getElementById(id);
        if (elem) {
            if (id === showId) {
                elem.classList.add("active");
                elem.classList.remove("hidden");
            } else {
                elem.classList.remove("active");
                elem.classList.add("hidden");
            }
        }
    });
}
function reset() {
    document.getElementById('ajouter_').disabled = false;
    document.getElementById('modifier_').disabled = true;
    document.getElementById('supprimer_').disabled = true;
    document.getElementById('annuler_').disabled = true;
    document.getElementById('Enregistrer_').disabled = true;
    //document.getElementById('fermer_').disabled = true;

    //document.getElementById('SaisieCheck').style.display = "none";
    document.getElementById('inlineRadio2').checked = true;
    //document.getElementById('SaisieCheck').style.display = 'none';

    document.getElementById('typeBase').disabled = true;
    document.getElementById('nomServeur_').disabled = true;
    document.getElementById('nomUser_').disabled = true;
    document.getElementById('nompassword_').disabled = true;
    document.getElementById('nomBDD_').disabled = true;

    document.getElementById('sigle_').disabled = true;
    document.getElementById('libelle_').disabled = true;

    document.getElementById('flexCheckDefault').disabled = true;

    document.getElementById('pencilButton').disabled = true;
    document.getElementById('hddButton').disabled = true;
    $("#EtatTraitement").html('');

    const tbody = document.getElementById('tabBase').querySelector('tbody');

    if (tbody.rows.length > 1) {
        const firstRow = tbody.rows[0];
        const numEnreg = firstRow.cells[0].innerHTML;
        const nomServeur = firstRow.cells[4].innerHTML;
        const nomUtilisateur = firstRow.cells[6].innerHTML;
        const motdePasse = firstRow.cells[7].innerHTML;
        const nomBase = firstRow.cells[5].innerHTML;
        const sigle = firstRow.cells[1].innerHTML;
        const libelle = firstRow.cells[2].innerHTML;
        const statut = firstRow.cells[8].innerHTML;
        const typeBase = firstRow.cells[3].innerHTML;
        $("#numEnreg").val(numEnreg);
        $("#nomServeur_").val(nomServeur);
        $("#nomUser_").val(nomUtilisateur);
        $("#nompassword_").val(motdePasse);
        $("#nomBDD_").val(nomBase);
        $("#sigle_").val(sigle);
        $("#libelle_").val(libelle);
        if (statut == "True") {
            document.getElementById('flexCheckDefault').checked = true;
        } else {
            document.getElementById('flexCheckDefault').checked = false;
        }
        if (typeBase == "SQL") {
            document.getElementById('labelNameBdd').textContent = "Nom de la Base";
        } else {
            document.getElementById('labelNameBdd').textContent = "Service Oracle";
        }
    } else {
        $("#numEnreg").val('');
        $("#nomServeur_").val('');
        $("#nomUser_").val('');
        $("#nompassword_").val('');
        $("#nomBDD_").val('');
        $("#sigle_").val('');
        $("#libelle_").val('');
        document.getElementById('flexCheckDefault').checked = false;
        document.getElementById('labelNameBdd').textContent = "Nom de la base";
    }
}
/*function toggleForms(showId, hideId) {
    let showElem = document.getElementById(showId);
    let hideElem = document.getElementById(hideId);

    if (showElem && hideElem) {
        hideElem.classList.remove("active");
        hideElem.classList.add("hidden");

        showElem.classList.remove("hidden");
        showElem.classList.add("active");
    } else {

    }
}*/