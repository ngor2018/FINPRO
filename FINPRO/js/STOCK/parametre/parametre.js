$(function () {
    paramater();
    $("#code").keyup(function () {
        this.value = this.value.toUpperCase();
    })
    $("#fermer").click(function () {
        document.getElementById('fullscreen_popup').style.display = "none";
    })
})
var Ajout = function () {
    toggleForms("partieUnique");
    resetForm();
}
function paramater() {
    var pageName = $("#pageName").val();
    var pageNameController = $("#pageNameController").val();
    var pageNameProjet = $("#pageNameProjet").val();
    var titre = $("#nameTitre");
    switch (pageName) {
        case "Pays":
            break;
    }
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
                            <table class="table table-bordered tabList" id="${pageName}">
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
    var list = "";
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
                                        <input type="text" name="code" value="" id="code" class="form-control input_focus"/>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-2">
                                        <label for="libelle">Libellé</label>
                                    </div>
                                    <div class="col-md-10">
                                        <input type="text" name="libelle" value="" id="libelle" class="form-control input_focus"/>
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
    var code = $("#pageName").val();
    // Vérifier si la table existe déjà et la réinitialiser
    if ($.fn.DataTable.isDataTable('#' + code)) {
        $('#' + code).DataTable().destroy();
        $("#" + code + " tbody").empty();
    }
    data.forEach(item => {
        var list = "";
        switch (code) {
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
        $("#" + code + " tbody").append(list);
    })
    DataTable(code);
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
}
function resetForm() {
    $(".input_focus").val('');
    $('.input_focus').siblings('span.erreur').css('display', 'none');
    document.getElementById('Supprimer').style.visibility = "hidden";
}
function toggleForms(showId) {
    // Liste des IDs des formulaires
    let forms = ["partieUnique", ""];
    resetForm();
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