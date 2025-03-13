var pageName = $("#pageName").val();
$(function () {

    paramater();
    $("#code").keyup(function () {
        this.value = this.value.toUpperCase();
    })
    $("#fermer").click(function () {
        document.getElementById('fullscreen_popup').style.display = "none";
    })
    $("#" + pageName + " tbody").on("click", "tr", function () {
        $(this).toggleClass("selected").siblings(".selected").removeClass("selected");
        toggleForms("partieUnique");
        var nomTitre = "Editer ";
        switch (pageName) {
            case "Pays":
                nomTitre += "Pays";
                break;
        }
        $("#titleParam_").html(nomTitre);
        // Supprimer les messages d'erreur
        $(".erreur").html('').hide();
        document.getElementById('code').disabled = true;
        $("#code").val(this.cells[0].innerHTML);
        $("#libelle").val(this.cells[1].innerHTML);
        document.getElementById('Supprimer').style.visibility = "visible";

    })
    $('.input_focus').keyup(function () {
        $(this).siblings('span.erreur').css('display', 'none');
    })
    $(".selectChoix").select2();
})
function changePrint() {
    var printTo = $("#printTo").val();
    var printEnd = $("#printEnd").val();
    loadData(pageName, printTo, printEnd);
}
var Enregistrer = function () {
    var isAllValid = true;
    var code = $("#code").val();
    var libelle = $("#libelle").val();
    if (code.trim() == '') {
        isAllValid = false;
        $("#code").siblings('span.erreur').html('champ obligatoire').css('display', 'block');
    }
    if (libelle.trim() == '') {
        isAllValid = false;
        $("#libelle").siblings('span.erreur').html('champ obligatoire').css('display', 'block');
    }
    if (isAllValid) {
        var EtatCod = document.getElementById('code');
        const objData = {
            code: code,
            libelle: libelle,
            niveau: pageName
        }
        switch (EtatCod.disabled) {
            case true:
                alert('Modification');
                break;
            default:
                //Ajout
                $.ajax({
                    url: "/Parametre/AddParam",
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(objData),
                    success: function (data) {
                        switch (data.statut) {
                            case true:
                                $('.alert_Param').removeClass("hide");
                                $('.alert_Param').addClass("show");
                                $('.alert_Param').addClass("showAlert");
                                $(".result_Param").html('<font style="color:#ce8500">' + data.message + '</font>');
                                setTimeout(function () {
                                    $('.alert_Param').addClass("hide");
                                    $('.alert_Param').removeClass("show");
                                    resetForm();
                                    loadData(pageName, "", "");
                                }, 1500);
                                break;
                            default:
                                $("#code").siblings('span.erreur').html(data.message).css('display', 'block');
                                break;
                        }
                    },

                    error: function (error) {
                        alert("Erreur lors de l'envoi des données.");
                        console.error(error);
                    }
                });
                break;
        }
    }
}
var Ajout = function () {
    toggleForms("partieUnique");
    resetForm();
    var nomTitre = "Ajout ";
    switch (pageName) {
        case "Pays":
            nomTitre += "Pays";
            break;
    }
    $("#titleParam_").html(nomTitre);
    setTimeout(function () {
        $("#code").focus();
    },500)
}
function paramater() {
    var pageNameController = $("#pageNameController").val();
    var pageNameProjet = $("#pageNameProjet").val();
    var titre = $("#nameTitre");
    titre.html(`
        <nav style="--phoenix-breadcrumb-divider: '&gt;&gt;';" aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">${pageNameProjet}</li>
            <li class="breadcrumb-item active" aria-current="page">${pageNameController}</li>
            <li class="breadcrumb-item active" aria-current="page"><u>${pageName}</u></li>
          </ol>
        </nav>
    `);
    formTable(pageName);

}
function formTable(pageName) {
    let formHTML = "";
    switch (pageName) {
        case "Pays":
        case "signataire":
        case "groupes":
        case "services":
        case "unite":
            formHTML = `
                    <div class="row">
                        <div class="col-md-12" style="padding-bottom:10px">
                            <div class="float-start">
                                <button class="btn btn-sm btn-primary" id="Imprimer" onclick="Imprimer()"> <i class="fas fa-print mr-2"></i>Imprimer</button>
                            </div>
                            <div class="float-end">
                                <button class="btn btn-sm btn-primary" id="Ajout" onclick="Ajout()"> <i class="fas fa-plus mr-2"></i>Ajouter</button>
                            </div>
                        </div>
                    </div>
                    <div class="row" style="padding-top:10px;padding-bottom:10px">
                        <div class="col-md-1">
                            <label for="printTo">De</label>
                        </div>
                        <div class="col-md-5">
                            <select id="printTo" onchange="changePrint()" class="input_focus selectChoix ${pageName}" style="width:100%">

                            </select>
                        </div>
                        <div class="col-md-1">
                            <label for="printEnd">A</label>
                        </div>
                        <div class="col-md-5">
                            <select id="printEnd" onchange="changePrint()" class="input_focus selectChoix ${pageName}" style="width:100%">

                            </select>
                        </div>
                    </div>
                    <div id="niveauImpression"></div>
                    <div class="row">
                        <div class="col-md-12">
                            <table class="table-bordered tabList" id="${pageName}" style="width:100%">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Libellé</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    `;
            break;
    }
    $("#formParam").append(formHTML);
    var printTo = $("#printTo").val();
    var printEnd = $("#printEnd").val();
    loadData(pageName,printTo,printEnd);
    formPopup(pageName);
}
function formPopup(pageName) {
    var list = "", tailleCode = 0;
    switch (pageName) {
        case "Pays":
            tailleCode = 3;
            break;
        case "signataire":
            tailleCode = 10;
            break;
        case "groupes":
            tailleCode = 2;
            break;
        case "services":
            tailleCode = 5;
            break;
        case "unite":
            tailleCode = 10;
            break;
    }
    switch (pageName) {
        case "Pays":
        case "signataire":
        case "groupes":
        case "services":
        case "unite":
            list = `
                    <div class="row justify-content-center" style="padding-top:12%">
                        <div class="col-md-6 pageView">
                            <div class="row">
                                <div class="col-md-12" style="padding-bottom: 10px;border-bottom:1px solid #bdb8b8">
                                    <div class="float-start">
                                        <strong id="titleParam_"></strong>
                                    </div>
                                    <div class="float-end">
                                        <button class="btn btn-sm  btn-danger me-1 mb-1" id="fermer">&times;Fermer</button>
                                    </div>
                                </div>
                            </div>
                            <div class="row justify-content-center" style="text-align:center">
                                <div class="col-md-12">
                                    <div class="alert_Param hide">
                                        <span class="fas fa-exclamation-circle"></span>
                                        <span class="result_Param"></span>
                                    </div>
                                </div>
                            </div>
                            <div class="form_padd">
                                <div class="row">
                                    <div class="col-md-2">
                                        <label for="code">Code</label>
                                    </div>
                                    <div class="col-md-4">
                                        <input type="text" name="code" value="" id="code" maxlength="${tailleCode}" class="input_focus"/>
                                        <span class='erreur'></span>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-2">
                                        <label for="libelle">Libellé</label>
                                    </div>
                                    <div class="col-md-10">
                                        <input type="text" name="libelle" value="" id="libelle" maxlength="250" class="input_focus"/>
                                        <span class='erreur'></span>
                                    </div>
                                </div>
                                <div class="row justify-content-end" style="text-align:right;padding-top:15px">
                                    <div class="col-md-12">
                                        <button class="btn btn-sm btn-success me-1 mb-1" id="Enregistrer" onclick="Enregistrer()">Enregistrer</button>
                                        <button class="btn btn-sm btn-danger me-1 mb-1" id="Supprimer" onclick="Supprimer()">Supprimer</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            break;
    }
    $("#partieUnique").append(list);
}
function loadData(code,printTo,prinEnd) {
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: {
            code: code,
            start: printTo,
            End: prinEnd
        },
        url: '/Parametre/GetDataParam', // URL de l'API pour récupérer les données
        success: function (data) {
            reportData(data);
        }
    })
}
function reportData(data) {
    if ($('.' + pageName).val() == "" || $('.' + pageName).val() == null) {
        $('.' + pageName).empty();
        $.each(data.listData, function (index, row) {
            $("." + pageName).append("<option value='" + row.code + "'>" + row.code + " " + row.libelle + "</option>");
        })
        var lastID = $("#printEnd option:last").val();
        $("#printEnd").val(lastID);
    }
    DataTable(pageName, data);
}
function DataTable(code,data) {
    var list = "";
    // Vérifier si la table existe déjà et la réinitialiser
    if ($.fn.DataTable.isDataTable('#' + code)) {
        $('#' + code).DataTable().destroy();
        $("#" + code + " tbody").empty();
    }
    data.listDataFiltre.forEach(item => {
        list = `<tr>
                    <td>${item.code}</td>
                    <td>${item.libelle}</td>
                </tr>`;
        $("#" + code + " tbody").append(list);
    });
    var table = $('#' + code).DataTable({
        "pageLength": 10,
        "lengthMenu": [[10, 50, 100, 150, 200, -1], [10, 50, 100, 150, 200, "Tous"]],
        "responsive": true,
        "lengthChange": true,
        "ordering": false,
        "language": {
            "lengthMenu": "Afficher _MENU_ entrées",
            "emptyTable": "Aucun élément trouvé",
            "info": "Affichage _START_ à _END_ de _TOTAL_ entrées",
            "loadingRecords": "Chargement...",
            "processing": "En cours...",
            "search": '<i class="fa fa-search" aria-hidden="true"></i>',
            "searchPlaceholder": "Rechercher...",
            "zeroRecords": "Aucun élément correspondant trouvé",
            "paginate": {
                "first": "Premier",
                "last": "Dernier",
                "next": "Suivant",
                "previous": "Précédent"
            }
        }
    });
    $("#" + pageName).removeClass("dataTable"); // Supprime la classe après l'initialisation

}
function resetForm() {
    $(".input_focus").val('');
    $('.input_focus').siblings('span.erreur').css('display', 'none');
    document.getElementById('Supprimer').style.visibility = "hidden";
    document.getElementById('code').disabled = false;
}
function toggleForms(showId) {
    // Liste des IDs des formulaires
    let forms = ["partieUnique", ""];
    document.getElementById('fullscreen_popup').style.display = "block";
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