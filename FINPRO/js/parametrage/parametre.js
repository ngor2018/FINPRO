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
            case "services":
                nomTitre += "Service";
                break;
            case "groupes":
                nomTitre += "Groupe";
                break;
            case "unite":
                nomTitre += "Unité";
                break;
            case "magasins":
                nomTitre += "Magasin (" + $("#site option:selected").text() + ")";
                break;
        }
        $("#titleParam_").html(nomTitre);
        // Supprimer les messages d'erreur
        $(".erreur").html('').hide();
        document.getElementById('code').disabled = true;
        $("#code").val(this.cells[0].innerHTML);
        $("#libelle").val(this.cells[1].innerHTML);
        document.getElementById('Supprimer').style.visibility = "visible";
        $("#libelle").focus();
    })
    $('.input_focus').keyup(function () {
        $(this).siblings('span.erreur').css('display', 'none');
    })
    $(".selectChoix").select2();
})
var Enregistrer = function () {
    var isAllValid = true;
    var code = $("#code").val();
    var libelle = $("#libelle").val();
    var site = $("#site").val();
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
        var etat = true;
        switch (EtatCod.disabled) {
            case true:
                //Edition
                etat = true;
                break;
            default:
                //Ajout
                etat = false;
                break;
        }
        const objData = {
            code: code,
            libelle: libelle,
            site: site,
            niveau: pageName,
            statut: etat
        }

        $.ajax({
            url: "/CRUD/Add_EditParam",
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
                            switch (etat) {
                                //Ajout
                                case false:
                                    resetForm();
                                    loadData(pageName, "", "");
                                    break;
                                //Edition
                                default:
                                    var table = document.getElementById(pageName);
                                    for (var i = 1; i < table.rows.length; i++) {
                                        var item = table.rows[i];
                                        if (item.cells[0].innerHTML == code) {
                                            item.cells[1].innerHTML = libelle;
                                        }
                                    }
                                    break;
                            }
                            document.getElementById('fermer').click();
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
        case "services":
            nomTitre += "Service";
            break;
        case "groupes":
            nomTitre += "Groupe";
            break;
        case "unite":
            nomTitre += "Unité";
            break;
        case "magasins":
            nomTitre += "Magasin (" + $("#site option:selected").text() + ")";
            break;
    }
    $("#titleParam_").html(nomTitre);
    setTimeout(function () {
        $("#code").focus();
    }, 500)
}
var Supprimer = function () {
    toggleForms("partieDelete");
    var nomTitre = "Suppression ";
    var nomTitreDel = "Voulez-vous supprimer Code ";
    var code = $("#code").val();
    switch (pageName) {
        case "Pays":
            nomTitre += "Pays";
            break;
        case "services":
            nomTitre += "Service";
            break;
        case "groupes":
            nomTitre += "Groupe";
            break;
        case "unite":
            nomTitre += "Unité";
            break;
        case "magasins":
            nomTitre += "Magasin";
            break;
    }
    nomTitreDel += '<strong><u>' + code + '</u></strong>';
    $("#titreDel").html(nomTitre);
    $("#messageDel").html(nomTitreDel);
}
var validerDel = function () {
    var code = $("#code").val();
    var site = $("#site").val();
    const objData = {
        code: code,
        site: site,
        niveau:pageName
    }
    $.ajax({
        url: "/CRUD/DelParam",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(objData),
        success: function (data) {
            switch (data.statut) {
                case true:
                    var table = document.getElementById(pageName);
                    for (var i = 1; i < table.rows.length; i++) {
                        var item = table.rows[i];
                        if (item.cells[0].innerHTML == code) {
                            table.deleteRow(i); //Supprimer la ligne correspondante
                            break; //Sort de la boucle apres supppression
                        }
                    }
                    closeDel();
                    document.getElementById('fermer').click();
                    break;
                case false:
                    $("#errorCodif").html(data.message);
                    break;
            }
        },

        error: function (error) {
            alert("Erreur lors de l'envoi des données.");
            console.error(error);
        }
    });
}
var closeDel = function () {
    toggleForms("partieUnique");
    $("#errorCodif").html('');
}
function paramater() {
    var pageNameController = $("#pageNameController").val();
    var pageNameProjet = $("#pageNameProjet").val();
    var titre = $("#nameTitre");
    titre.html(`
        <nav style="--phoenix-breadcrumb-divider: '&gt;&gt;';" aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">${pageNameController}</li>
            <li class="breadcrumb-item active" aria-current="page">${pageNameProjet}</li>
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
        case "magasins":
        case "Exercices":
            formHTML = `
                    <div id="partieSite">
                    </div>
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
                    <div id="niveauImpression"></div>
                    <div id="niveauFormTableau"></div>                    
                    `;
            break;
    }
    $("#formParam").append(formHTML);
    formTableTOP(pageName);
    formTableau(pageName);
    loadData(pageName);
    formPopup(pageName);
    formDel();
}
function formTableTOP(pageName) {
    let formHTML = "";
    formHTML = `
                    <div class="row">
                        <div class="col-md-2">
                            <label for="site" id="nameLabel"></label>
                        </div>
                        <div class="col-md-4">
                            <select id="site" style="width:100%" class="selectChoix">
                            </select>
                        </div>
                    </div>
                `;
    switch (pageName) {
        case "magasins":
            $("#partieSite").append(formHTML);
            document.getElementById('nameLabel').textContent = "Site";
            break;
    }
}
function formTableau(pageName) {
    let formHTML = "";
    switch (pageName) {
        case "Pays":
        case "signataire":
        case "groupes":
        case "services":
        case "unite":
        case "magasins":
            formHTML = `
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
        case "Exercices":
            formHTML = `
                       <div class="row">
                            <div class="col-md-12">
                                <table class="table-bordered tabList" id="${pageName}" style="width:100%">
                                    <thead>
                                        <tr>
                                            <th>Année</th>
                                            <th>Date de début d'exercice</th>
                                            <th>Date de fin d'exercice</th>
                                            <th>En Cours</th>
                                            <th>Date de clôture</th>
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
    $("#niveauFormTableau").append(formHTML);
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
        case "magasins":
            tailleCode = 2;
            break;
    }
    switch (pageName) {
        case "Pays":
        case "signataire":
        case "groupes":
        case "services":
        case "unite":
        case "magasins":
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
function formDel() {
    let container = document.getElementById("partieDelete");
    container.innerHTML = "";
    let formHTML = `
            <div class="row justify-content-center" style="padding-top:12%">
                <div class="col-md-4 pageView">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="float-start">
                                <strong id="titreDel"></strong>
                            </div>
                            <div class="float-end">
                                <button class="btn btn-sm btn-danger closeDel" onclick="closeDel()">&times;</button>
                            </div>
                        </div>
                    </div><hr />
                    <div class="row justify-content-center" style="text-align:center;padding-top:20px;padding-bottom:20px">
                        <div class="col-md-12">
                            <img src="../../images/question.png" style="width:20px" /><span id="messageDel"></span>
                        </div>
                    </div>
                    <div class="row justify-content-center" style="text-align:center;padding-top:8px;padding-bottom:8px">
                        <div>
                            <span id="errorCodif" style="color:red"></span>
                        </div>
                    </div>
                    <hr />
                    <div class="row justify-content-end" style="text-align:right">
                        <div class="col-md-12">
                            <button class="btn btn-sm btn-success" onclick="validerDel()">Oui</button>
                            <button class="btn btn-sm btn-danger closeDel" onclick="closeDel()">Non</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    container.insertAdjacentHTML("beforeend", formHTML);
}
function loadData(code) {
    var site = $("#site").val();
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: {
            code: code,
            site: site,
        },
        url: '/CRUD/GetDataParam', // URL de l'API pour récupérer les données
        success: function (data) {
            reportData(data);
        }
    })
}
function reportData(data) {
    if ($("#site").val() == "" || $("#site").val() == null) {
        $('#site').empty();
        $.each(data.listDataSite, function (index, row) {
            $("#site").append("<option value='" + row.code + "'>" + row.libelle + "</option>");
        })
    }
    DataTable(pageName, data);
}
function DataTable(code, data) {

    // Vérifier si la table existe déjà et la réinitialiser
    if ($.fn.DataTable.isDataTable('#' + code)) {
        $('#' + code).DataTable().destroy();
        $("#" + code + " tbody").empty();
    }
    // Configuration des colonnes pour chaque type de table
    const config = {
        default: ["code", "libelle"],
        Exercices: ["annee", "dateDebut", "dateFin", "etat", "dateCloture"]
    };

    // Générer une ligne HTML en fonction des colonnes définies
    function generateRow(item, columns) {
        return `<tr>` + columns.map(col => `<td>${col === "etat" ? generateEtatCheckbox(item[col]) : item[col] || ""}</td>`).join('') + `</tr>`;
    }

    // Générer un champ checkbox pour l'état (statut)
    function generateEtatCheckbox(status) {
        return `
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" ${status ? "checked" : ""} />
            </div>
        `;
    }
    // Déterminer les colonnes à utiliser
    const columns = config[code] || config.default;

    // Générer les lignes et les insérer dans le tableau
    const rows = data.listData.map(item => generateRow(item, columns)).join('');
    $("#" + code + " tbody").append(rows);

    // Initialisation de DataTable
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
    let forms = ["partieUnique", "partieDelete"];
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