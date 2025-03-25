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
            case "Exercies":
                nomTitre += "Exercice";
                break;
            case "magasins":
                nomTitre += "Magasin (" + $("#site option:selected").text() + ")";
                break;
            case "Monnaie":
                nomTitre += "Monnaie";
                break;
        }
        $("#titleParam_").html(nomTitre);
        // Supprimer les messages d'erreur
        $(".erreur").html('').hide();
        switch (pageName) {
            case "Exercices":
                document.getElementById('annee').disabled = true;
                document.getElementById('annee').value = this.cells[0].innerHTML;
                document.getElementById('DebutDate').value = afficherDateyyyyMMdd(this.cells[1].innerHTML);
                document.getElementById('FinDate').value = afficherDateyyyyMMdd(this.cells[2].innerHTML);
                
                if (this.cells[3].innerHTML.includes('checked')) {
                    document.getElementById('checkEncours').checked = true;
                } else {
                    document.getElementById('checkEncours').checked = false;
                }
                break;
            case "Monnaie":
                document.getElementById('code').disabled = true;
                document.getElementById('code').value = this.cells[0].innerHTML;
                document.getElementById('libelle').value = this.cells[1].innerHTML;
                document.getElementById('nomM').value = this.cells[2].innerHTML;
                document.getElementById('nombreM').value = this.cells[3].innerHTML;
                loadDetailDataBPi(pageName, this.cells[0].innerHTML);
                break;
            default:
                document.getElementById('code').disabled = true;
                $("#code").val(this.cells[0].innerHTML);
                $("#libelle").val(this.cells[1].innerHTML);
                $("#libelle").focus();
                break;
        }
        document.getElementById('Supprimer').style.visibility = "visible";
    })
    $('.input_focus').keyup(function () {
        $(this).siblings('span.erreur').css('display', 'none');
    })
    $('.input_focus').change(function () {
        $(this).siblings('span.erreur').css('display', 'none');
        switch (pageName) {
            case "Exercices":
                $("#ControleDateSup").html('');
                break;
        }
    })
    $(".selectChoix").select2();
    initTableInteractions();
})
var Enregistrer = function () {
    var isAllValid = true;
    var code = $("#code").val();
    var libelle = $("#libelle").val();
    var site = $("#site").val();

    //Exercice
    var annee = $("#annee").val();
    var dateDebut = $("#DebutDate").val();
    var dateFin = $("#FinDate").val();
    var EnCours = document.getElementById('checkEncours')?.checked ?? false;
    switch (pageName) {
        case "Pays":
        case "signataire":
        case "groupes":
        case "services":
        case "unite":
        case "magasins":
            if (code.trim() == '') {
                isAllValid = false;
                setErrorMessage("#code", "champ obligatoire", isAllValid);
            }
            if (libelle.trim() == '') {
                isAllValid = false;
                setErrorMessage("#libelle", "champ obligatoire", isAllValid);
            }
            break;
        case "Exercices":
            if (annee.trim() == '') {
                isAllValid = false;
                setErrorMessage("#annee", "champ obligatoire", isAllValid);
            }
            if (dateDebut.trim() == '') {
                isAllValid = false;
                setErrorMessage("#DebutDate", "champ obligatoire", isAllValid);
            } else {
                const endDateD = document.getElementById('DebutDate').value;

                const yearD = endDateD.split('-')[0];
                // Vérifier si l'année a 4 caractères
                if (yearD.length === 4 && !isNaN(yearD)) {
                    $("#DebutDate").siblings('span.error').css('display', 'none');
                } else {
                    isAllValid = false;
                    setErrorMessage("#DebutDate", "Revoir l\'année.", isAllValid);
                }
            }
            if (dateFin.trim() == '') {
                isAllValid = false;
                setErrorMessage("#FinDate", "champ obligatoire", isAllValid);
            } else {
                const startDate = document.getElementById('DebutDate').value;
                const endDate = document.getElementById('FinDate').value;
                const resultElement = document.getElementById('ControleDateSup');
                const start = new Date(startDate);
                const end = new Date(endDate);

                const yearCloture = endDate.split('-')[0];
                // Vérifier si l'année a 4 caractères
                if (yearCloture.length === 4 && !isNaN(yearCloture)) {
                    resultElement.textContent = '';
                    if (end < start) {
                        isAllValid = false;
                        resultElement.textContent = 'La date fin doit être supérieure ou égale à la date début.';
                    }
                } else {
                    isAllValid = false;
                    setErrorMessage("#FinDate", "Revoir l\'année.", isAllValid);
                }
            }
            break;
    }
    if (isAllValid) {
        var EtatCod = null;
        var etat = true;
        switch (pageName) {
            case "Pays":
            case "signataire":
            case "groupes":
            case "services":
            case "unite":
            case "magasins":
                EtatCod = document.getElementById('code');
                break;
            case "Exercices":
                EtatCod = document.getElementById('annee');
        }
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
            statut: etat,

            annee: annee,
            Encours: EnCours,
            dateDebut: dateDebut,
            dateFin: dateFin,
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
                                    loadData(pageName);
                                    break;
                                //Edition
                                default:
                                    var table = document.getElementById(pageName);
                                    switch (pageName) {
                                        case "Exercices":
                                            loadData(pageName);
                                            break;
                                        default:
                                            for (var i = 1; i < table.rows.length; i++) {
                                                var item = table.rows[i];
                                                if (item.cells[0].innerHTML == code) {
                                                    item.cells[1].innerHTML = libelle;
                                                }
                                            }
                                            break;
                                    }
                                    break;
                            }
                            document.getElementById('fermer').click();
                        }, 1500);
                        break;
                    default:
                        switch (pageName) {
                            case "Pays":
                            case "services":
                            case "groupes":
                            case "unite":
                            case "magasins":
                                $("#code").siblings('span.erreur').html(data.message).css('display', 'block');
                                break;
                            case "Exercices":
                                $("#annee").siblings('span.erreur').html(data.message).css('display', 'block');
                                break;
                        }
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
        case "Exercices":
            nomTitre += "Exercice";
            break;
        case "Monnaie":
            nomTitre += "Monnaie";
            break;
    }
    $("#titleParam_").html(nomTitre);
    setTimeout(function () {
        $("#code").focus();
        $("#annee").focus();
    }, 500)
}
var Supprimer = function () {
    toggleForms("partieDelete");
    var nomTitre = "Suppression ";
    var nomTitreDel = "Voulez-vous supprimer Code ";
    var code = null;
    switch (pageName) {
        case "Pays":
            code = $("#code").val();
            nomTitre += "Pays";
            break;
        case "services":
            code = $("#code").val();
            nomTitre += "Service";
            break;
        case "groupes":
            code = $("#code").val();
            nomTitre += "Groupe";
            break;
        case "unite":
            code = $("#code").val();
            nomTitre += "Unité";
            break;
        case "magasins":
            code = $("#code").val();
            nomTitre += "Magasin";
        case "Exercices":
            code = $("#annee").val();
            nomTitre += "Exercice";
            break;
    }
    nomTitreDel += '<strong><u>' + code + '</u></strong>';
    $("#titreDel").html(nomTitre);
    $("#messageDel").html(nomTitreDel);
}
var validerDel = function () {
    var code = null;
    switch (pageName) {
        case "Exercices":
            code = $("#annee").val();
            break;
        default:
            code = $("#code").val();
    }
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
        case "Monnaie":
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
    formPopupParieSaisie(pageName);
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
                                            <th rowspan="2">Année</th>
                                            <th colspan="3">Date</th>
                                            <th rowspan="2">En Cours</th>
                                        </tr>
                                        <tr>
                                            <th>Début</th>
                                            <th>Fin</th>
                                            <th>Clôture</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                            </div>
                        </div> 
                    `;
            break;
        case "Monnaie":
            formHTML = `
                       <div class="row">
                            <div class="col-md-12">
                                <table class="table-bordered tabList" id="${pageName}" style="width:100%">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Libellé</th>
                                            <th>Nom</th>
                                            <th>Nombre</th>
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
    var list = "";
    switch (pageName) {
        case "Pays":
        case "signataire":
        case "groupes":
        case "services":
        case "unite":
        case "magasins":
        case "Exercices":
        case "Monnaie":
            list = `
                    <div class="row justify-content-center" style="padding-top:4%">
                        <div class="col-md-8 pageView">
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
                                <div id="zoneSaisie"></div>
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
function formPopupParieSaisie(pageName) {
    let formHTML = "", tailleCode = 0;
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
        case "Exercices":
            tailleCode = 4;
        case "Monnaie":
            tailleCode = 3;
    }
    switch (pageName) {
        case "Pays":
        case "signataire":
        case "groupes":
        case "services":
        case "unite":
        case "magasins":
            formHTML = `
                        <div class="row">
                            <div class="col-md-2">
                                <label for="code">Code</label>
                            </div>
                            <div class="col-md-4">
                                <input type="text" name="code" value="" id="code" maxlength="${tailleCode}" class="input_focus" />
                                <span class='erreur'></span>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-2">
                                <label for="libelle">Libellé</label>
                            </div>
                            <div class="col-md-10">
                                <input type="text" name="libelle" value="" id="libelle" maxlength="250" class="input_focus" />
                                <span class='erreur'></span>
                            </div>
                        </div>
                    `;
            break;
        case "Exercices":
            formHTML = `
                        <div class="row">
                            <div class="col-md-2">
                                <label for="annee">Année</label>
                            </div>
                            <div class="col-md-4">
                                <input type="text" name="annee" value="" maxlength="${tailleCode}" id="annee" class="input_focus"/>
                                <span class='erreur'></span>
                            </div>
                            <div class="col-md-4"></div>
                            <div class="col-md-2">
                                <div class="form-check">
                                    <input style='cursor:pointer' class="form-check-input" id="checkEncours" type="checkbox" value="" />
                                    <label style='cursor:pointer' class="form-check-label" for="checkEncours">En cours</label>
                                </div>
                            </div>
                        </div>
                        <div class="row justify-content-center" style="text-align:center;padding-top:10px">
                            <div class="col-md-12">
                                <h5>Date d'exercice</h5>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-2">
                                <label for="DebutDate">Début</label>
                            </div>
                            <div class="col-md-4">
                                <input type="date" name="DebutDate" value="" id="DebutDate" class="input_focus DateSaisie"/>
                                <span class='erreur'></span>    
                            </div>
                            <div class="col-md-2">
                                <label for="FinDate">Fin</label>
                            </div>
                            <div class="col-md-4">
                                <input type="date" name="FinDate" value="" id="FinDate" class="input_focus DateSaisie"/>
                                <span class='erreur'></span>
                            </div>
                        </div>
                        <div class="row justify-content-center" style="text-align:center">
                            <div class="col-md-12">
                                <span id='ControleDateSup' style='color:red'></span>
                            </div>
                        </div>
                    `;
            break;
        case "Monnaie":
            formHTML = `
                       <div class="row">
                            <div class="col-md-12">
                                <h5>Saisie</h5>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <div class="col-md-2">
                                <label for="code">Code</label>
                            </div>
                            <div class="col-md-4">
                                <input type="text" name="code" value="" id="code" maxlength="${tailleCode}" class="input_focus" />
                                <span class='erreur'></span>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <div class="col-md-2">
                                <label for="libelle">Libellé</label>
                            </div>
                            <div class="col-md-10">
                                <input type="text" name="libelle" value="" id="libelle" maxlength="250" class="input_focus" />
                                <span class='erreur'></span>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-12">
                                <h5>Décimales et Formats</h5>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <div class="col-md-2">
                                <label for="nomM">Nom</label>
                            </div>
                            <div class="col-md-4">
                                <input type="text" name="nomM" value="" id="nomM" class="input_focus" maxlength="25"/>
                            </div>
                            <div class="col-md-2">
                                <label for="nombreM">Nombre</label>
                            </div>
                            <div class="col-md-4">
                                <input type="text" name="nombreM" value="" id="nombreM" class="input_focus" maxlength="1"/>
                            </div>
                        </div><hr />
                        <div class="row mb-2">
                            <div class="col-md-12">
                                <div class="float-start" style="width:45%">
                                    <div class="row mb-2 justify-content-end" style="text-align:right">
                                        <div class="col-md-12">
                                            <button data-table="Billet_${pageName}" class="btn-ajout buttonTab" title="Ajouter"><i class="uil-focus-add"></i></button>
                                            <button data-table="Billet_${pageName}" class="btn-editer buttonTab" title="Editer"><i class="uil-edit-alt"></i></button>
                                            <button data-table="Billet_${pageName}" class="btn-supprimer buttonTab" title="Supprimer"><i class="uil-trash-alt"></i></button>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-12" style="max-height: 200px; overflow-y: auto;">
                                            <table class="table-bordered tabList" width="100%" id="Billet_${pageName}">
                                                <thead class="sticky-top bg-white">
                                                    <tr>
                                                        <th colspan="3" style="text-align:left">Billets de</th>
                                                    </tr>
                                                    <tr>
                                                        <th hidden></th>
                                                        <th></th>
                                                        <th style="width:95%"><strong>VALEUR</strong></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div class="float-end" style="width:45%">
                                    <div class="row mb-2 justify-content-end" style="text-align:right">
                                        <div class="col-md-12">
                                            <button data-table="Piece_${pageName}" class="btn-ajout buttonTab" title="Ajouter"><i class="uil-focus-add"></i></button>
                                            <button data-table="Piece_${pageName}" class="btn-editer buttonTab" title="Editer"><i class="uil-edit-alt"></i></button>
                                            <button data-table="Piece_${pageName}" class="btn-supprimer buttonTab" title="Supprimer"><i class="uil-trash-alt"></i></button>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-12" style="max-height: 200px; overflow-y: auto;">
                                            <table class="table-bordered tabList" width="100%" id="Piece_${pageName}">
                                                <thead class="sticky-top bg-white">
                                                    <tr>
                                                        <th colspan="3" style="text-align:left">Pièces de</th>
                                                    </tr>
                                                    <tr>
                                                        <th hidden></th>
                                                        <th></th>
                                                        <th style="width:95%"><strong>VALEUR</strong></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
            break;
    }
    $("#zoneSaisie").append(formHTML); 
    let code;
    switch (pageName) {
        case "Pays":
        case "signataire":
        case "groupes":
        case "services":
        case "unite":
        case "magasins":
            code = document.getElementById('code');
            formatChiffreLettreInput(code);
            break;
        case "Exercices":
            code = document.getElementById('annee');
            formatChiffreInput(code);
            break;
        case "Monnaie":
            code = document.getElementById('code');
            formatChiffreLettreInput(code);
            const nombreM = document.getElementById('nombreM');
            formatChiffreInput(nombreM);
            break;
    }
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
        url: '/CRUD/GetDataParam',
        success: function (data) {
            reportData(data);
        }
    })
}
function loadDetailDataBPi(pageName, code) {
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: { page: pageName, code: code },
        url: '/CRUD/GetDataDetailParamBPi',
        success: function (data) {
            ["Billet", "Piece"].forEach(type => {
                if (data[type].length > 0) {
                    let tableBody = $(`#${type}_${pageName} tbody`);
                    tableBody.empty(); // Nettoyer avant d'ajouter

                    data[type].forEach((item, index) => {
                        let rowIndex = index + 1; // Index automatique si pas fourni
                        let list = `<tr>
                            <td hidden>${item.code}</td>
                            <td style='text-align:right'>${item[`rowIndex${type.charAt(0)}`] || rowIndex}</td>
                            <td style='text-align:right'>${item.valeur}</td>
                        </tr>`;
                        tableBody.append(list);
                    });

                    //let firstRow = tableBody.find("tr:first");
                    //firstRow.addClass("selected").siblings().removeClass("selected");
                }
            });
        }
    });
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
        default: { columns: ["code", "libelle"], styles: {} },
        Exercices: {
            columns: ["annee", "dateDebut", "dateFin", "statut", "dateCloture"],
            styles: {
                annee: "text-align: right;",
                dateDebut: "text-align: center;",
                dateFin: "text-align: center;",
                dateCloture: "text-align: right;",
                statut: "text-align: center;"
            }
        },
        Monnaie: {
            columns: ["code", "libelle", "libelleM", "nbreDecimale"],
            styles: {
                code: "text-align: left;",
                libelle: "text-align: left;",
                libelleM: "text-align: left;",
                nbreDecimale: "text-align: right;",
            }
        }
    };

    // Générer une ligne HTML en fonction des colonnes définies
    function generateRow(item, columns,styles) {
        return `<tr>` +
                columns.map(col => {
                    let style = styles[col] ? ` style='${styles[col]}'` : "";
                    return `<td${style}>${col === "statut" ? generateEtatCheckbox(item[col]) : item[col] || ""}</td>`;
                }).join('') +
            `</tr>`;
    }

    // Générer un champ checkbox pour l'état (statut)
    function generateEtatCheckbox(status) {
        return `
            <input class="" disabled type="checkbox" ${status ? "checked" : ""} />
        `;
    }
    // Déterminer les colonnes et styles à utiliser
    const { columns, styles } = config[code] || config.default;

    // Générer les lignes et les insérer dans le tableau
    const rows = data.listData.map(item => generateRow(item, columns, styles)).join('');
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
function initTableInteractions() {
    ["Billet", "Piece"].forEach(type => {
        let tableBody = document.querySelector(`#${type}_${pageName} tbody`);

        if (tableBody) {
            // Gestion de l'édition avec le bouton "Éditer"
            document.querySelectorAll(`.btn-editer[data-table="${type}_${pageName}"]`).forEach(button => {
                button.addEventListener("click", function () {
                    let selectedRow = tableBody.querySelector("tr.selected");
                    if (!selectedRow) {
                        alert("Veuillez sélectionner une ligne à modifier.");
                        return;
                    }
                    editCell(selectedRow.cells[2], tableBody);
                });
            });

            // Sélection d'une ligne sur clic
            tableBody.addEventListener("click", function (event) {
                let row = event.target.closest("tr");
                if (!row) return;

                // Vérifier si la ligne est déjà sélectionnée
                let isSelected = row.classList.contains("selected");

                // Désélectionner toutes les lignes
                tableBody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));

                // Si elle n'était pas sélectionnée, la sélectionner
                if (!isSelected) {
                    row.classList.add("selected");
                }
            });

            // Gestion de la suppression
            document.querySelector(`.btn-supprimer[data-table="${type}_${pageName}"]`)?.addEventListener("click", function () {
                let selectedRow = tableBody.querySelector("tr.selected");
                if (!selectedRow) {
                    alert("Veuillez sélectionner une ligne à supprimer.");
                    return;
                }
                let code = selectedRow.cells[0].textContent.trim(); // Récupérer code
                selectedRow.remove();
                console.log(`Ligne avec code ${code} supprimée.`);
            });
            // Gestion de l'ajout d'une nouvelle ligne
            document.querySelector(`.btn-ajout[data-table="${type}_${pageName}"]`)?.addEventListener("click", function () {
                let rowIndex = tableBody.children.length + 1; // Numéro de ligne
                let newRow = document.createElement("tr");
                newRow.innerHTML = `
                    <td hidden></td> <!-- Code (peut être ajouté plus tard) -->
                    <td style='text-align:right'>${rowIndex}</td> <!-- Index -->
                    <td style='text-align:right'></td> <!-- Valeur vide, éditable -->
                `;

                tableBody.appendChild(newRow);
                console.log("Nouvelle ligne ajoutée.");
            });
        }
    });
}

// Fonction d'édition d'une cellule
function editCell(td, tbody) {
    if (!td || td.querySelector("input")) return;

    let oldValue = td.textContent.trim();
    let input = document.createElement("input");
    input.type = "text";
    input.value = oldValue;
    input.style.width = "100%";
    input.style.textAlign = "right";

    // Appliquer la restriction pour n'accepter que des chiffres
    formatChiffreInput(input);

    input.addEventListener("blur", function () {
        let newValue = input.value.trim();
        if (newValue === "") {
            td.closest("tr").remove(); // Supprime la ligne si vide
        } else {
            // Vérifier si la valeur existe déjà
            if (checkDuplicateValue(tbody, newValue)) {
                alert("Cette valeur existe déjà !");
                td.textContent = oldValue;
            } else {
                td.textContent = newValue;
                //Faire Traitement dans la BDD
                // Récupérer l'ID du tableau parent
                let tableId = td.closest("table")?.id || "ID introuvable";
                if (newValue != oldValue) {
                    // Afficher les alertes
                    //alert(`Nouvelle valeur : ${newValue} dans tableau concerné id=${tableId}`);
                    AddOrEditMonnaie(tableId, newValue);
                }
            }
        }
    });

    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            input.blur();
        } else if (event.key === "Escape") {
            td.textContent = oldValue;
        }
    });

    td.textContent = "";
    td.appendChild(input);
    input.focus();
}

// Vérification des doublons
function checkDuplicateValue(tbody, value) {
    return Array.from(tbody.querySelectorAll("td:nth-child(3)")).some(td => td.textContent.trim() === value);
}
function AddOrEditMonnaie(tabID, value) {
    var codeM = $("#code").val();
    const objData = {
        code: codeM,
        tabID: tabID,
        valeur:value
    }
    $.ajax({
        url: "/CRUD/AddOrEditMonnaie",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(objData),
        success: function (data) {
            alert(data.message)
        },

        error: function (error) {
            alert("Erreur lors de l'envoi des données.");
            console.error(error);
        }
    });
}
function resetForm() {
    switch (pageName) {
        case "Pays":
        case "signataire":
        case "groupes":
        case "services":
        case "unite":
        case "magasins":
        case "Monnaie":
            document.getElementById('code').disabled = false;
            break;
        case "Exercices":
            document.getElementById('annee').disabled = false;
            $('.DateSaisie').val('').attr('type', 'text').attr('type', 'date');
            $("#ControleDateSup").html('');
            break;
    }
    $(".input_focus").val('');
    $('.input_focus').siblings('span.erreur').css('display', 'none');
    document.getElementById('Supprimer').style.visibility = "hidden";
}
function setErrorMessage(selector, message, isValid) {
    if (!isValid) {
        $(selector).siblings('span.erreur').html(message).css('display', 'block');
    } else {
        $(selector).siblings('span.erreur').css('display', 'none');
    }
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
// Fonction pour formater les entrées alphanumériques seulement number
function formatChiffreInput(input) {
    input.addEventListener('keydown', function (event) {
        const key = event.key;
        const isNumber = /^[0-9]$/.test(key);
        const isAllowedKey = (
            isNumber ||
            key === 'Backspace' ||
            key === 'Delete' ||
            key === 'ArrowLeft' ||
            key === 'ArrowRight' ||
            key === 'ArrowUp' ||
            key === 'ArrowDown' ||
            key === 'Tab'
        );

        if (!isAllowedKey) {
            event.preventDefault();
        }
    });
}
// Fonction pour formater les entrées alphanumériques
function formatChiffreLettreInput(input) {
    input.addEventListener('keydown', function (event) {
        const key = event.key;
        const isLetter = /^[a-zA-Z]$/.test(key);
        const isNumber = /^[0-9]$/.test(key);
        const isAllowedKey = (
            isLetter ||
            isNumber ||
            key === 'Backspace' ||
            key === 'Delete' ||
            key === 'ArrowLeft' ||
            key === 'ArrowRight' ||
            key === 'ArrowUp' ||
            key === 'ArrowDown' ||
            key === 'Tab'
        );

        if (!isAllowedKey) {
            event.preventDefault();
        }
    });
}
function afficherDateyyyyMMdd(date) {
    const [day, month, year] = date.split("/");
    const formatDate = `${year}-${month}-${day}`;
    return formatDate;
}
function afficherDateddMMyyyy(date) {
    const today = new Date(date);
    const jour = String(today.getDate()).padStart(2, '0'); // Jour sur 2 chiffres
    const mois = String(today.getMonth() + 1).padStart(2, '0'); // Mois (0-indexé, donc +1)
    const annee = today.getFullYear(); // Année

    // Format jj/MM/yyyy
    const dateFormattee = `${jour}/${mois}/${annee}`;

    return dateFormattee;
}
////Appliquer un séparateur de millier
function separateur_mil(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ' ' + '$2');
    }
    return x1 + x2;
}