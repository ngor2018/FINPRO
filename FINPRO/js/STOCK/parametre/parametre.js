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
        // Supprimer les messages d'erreur
        $(".erreur").html('').hide();
        document.getElementById('code').disabled = true;
        $("#code").val(this.cells[0].innerHTML);
        $("#libelle").val(this.cells[1].innerHTML);
        document.getElementById('Supprimer').style.visibility = "visible";

        toggleForms("partieUnique");
        var nomTitre = "Editer ";
        switch (pageName) {
            case "Pays":
                nomTitre += "Pays";
                break;
        }
        $("#titleParam_").html(nomTitre);
    })
})
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
        alert('');
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
    var list = "";
    switch (pageName) {
        case "Pays":
        case "signataire":
        case "groupes":
        case "services":
        case "unite":
            list = `
                    <div class="row">
                        <div class="col-md-12" style="padding-bottom:10px">
                            <div class="float-end">
                                <button class="btn btn-sm btn-primary" id="Ajout" onclick="Ajout()"> <i class="fas fa-plus mr-2"></i>Ajouter</button>
                            </div>
                        </div>
                    </div>
                    <div id="niveauImpression"></div>
                    <div class="row">
                        <div class="col-md-12">
                            <table class="table-bordered tabList" id="${pageName}">
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
    $("#formParam").append(list);
    loadData(pageName);
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
                    <div class="row justify-content-center" style="padding-top:2%">
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
function loadData(code) {
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: {
            code: code,
        },
        url: '/Parametre/GetDataParam', // URL de l'API pour récupérer les données
        success: function (data) {
            reportData(data);
        }
    })
}
function reportData(data) {
    // Vérifier si la table existe déjà et la réinitialiser
    if ($.fn.DataTable.isDataTable('#' + pageName)) {
        $('#' + pageName).DataTable().destroy();
        $("#" + pageName + " tbody").empty();
    }
    data.forEach(item => {
        var list = "";
        switch (pageName) {
            case "Pays":
            case "signataire":
            case "groupes":
            case "services":
            case "unite":
                list = `
                        <tr>
                            <td>${item.code}</td>
                            <td>${item.libelle}</td>
                        </tr>
                     `;
                break;

        }
        // Ajouter la ligne générée au tableau
        $("#" + pageName + " tbody").append(list);
    })
    DataTable(pageName);

}
function DataTable(code) {
    $('#' + code).DataTable({
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