var pageName = $("#pageName").val();
var isDelete = false;
var isEditing = false;
$(function () {
    paramater();
    $("#code").keyup(function () {
        this.value = this.value.toUpperCase();
    })
    $("#code1,#code2").change(function () {
        var idCode = this.id;
        if (idCode == "code1") {
            $("#code2").val(null).trigger('change');
        }
        //switch (pageName) {
        //    case "Articles":
        //    case "Affectations":
        //        $("#code2").off('change').val(null).trigger('change');
        //        setTimeout(() => {
        //            $("#code2").on('change', function () {
        //                alert("Code2 changé !");
        //                loadData(pageName);
        //            });
        //        }, 10);
        //        break;
        //}
        loadData(pageName);
    });
    $("#fermer").click(function () {
        document.getElementById('fullscreen_popup').style.display = "none";
        switch (pageName) {
            case "Monnaie":
                $("#Billet_" + pageName + " tbody").empty();
                $("#Piece_" + pageName + " tbody").empty();
                break;
        }
    })
    $("#" + pageName + " tbody").on("click", "tr", function () {
        if (isEditing) return; // Désactiver si en mode édition
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
                nomTitre += "Magasin (" + $("#code1 option:selected").text() + ")";
                break;
            case "Monnaie":
                nomTitre += "Monnaie";
                document.getElementById('partieBilletPiece').style.display = "block";
                break;
            case "Articles":
                var code1 = $("#code1 option:selected").text();
                var code2 = $("#code2 option:selected").text();
                nomTitre += "(Groupe (" + code1 + " " + code2 + ")";
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
            case "Articles":
                document.getElementById('disableEtat').disabled = true;
                var table = $('#' + pageName).DataTable();
                var rowData = table.row(this).data(); // même les colonnes masquées !

                document.getElementById('codeArticle').value = rowData[0];
                document.getElementById('libelle').value = rowData[1];
                document.getElementById('reference').value = rowData[2];
                $("#unite").val(rowData[3]).trigger('change');
                document.getElementById('serie').value = rowData[4];
                document.getElementById('prixUnitaire').value = rowData[5];
                document.getElementById('observation').value = rowData[6];

                const randomValue = generateRandomValue();
                if (rowData[7] == "" || rowData[7] == null) {
                    $("#articleCodeBar").val(randomValue);
                } else {
                    $("#articleCodeBar").val(rowData[7]);
                }
                var text = document.getElementById('articleCodeBar');
                genererCodeBar(text);
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
    var code1 = $("#code1").val();
    var code2 = $("#code2").val();

    var annee = $("#annee").val();
    var dateDebut = $("#DebutDate").val();
    var dateFin = $("#FinDate").val();
    var nomM = $("#nomM").val();
    var nombre = $("#nombreM").val();

    var unite = $("#unite").val();
    var reference = $("#reference").val();
    var prixUnitaire = $("#prixUnitaire").val();
    var codeBarre = $("#articleCodeBar").val();
    var observation = $("#observation").val();

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
        case "Monnaie":
            if (code.trim() == '') {
                isAllValid = false;
                setErrorMessage("#code", "champ obligatoire", isAllValid);
            }
            if (libelle.trim() == '') {
                isAllValid = false;
                setErrorMessage("#libelle", "champ obligatoire", isAllValid);
            }
            if (nombre.trim() == '') {
                nombre = 0;
            }
            break;
        case "Articles":
            if (libelle.trim() == '') {
                isAllValid = false;
                setErrorMessage("#libelle", "champ obligatoire", isAllValid);
            }
            if (unite == 0 || unite == null) {
                isAllValid = false;
                setErrorMessage("#unite", "champ obligatoire", isAllValid);
            }
            if (prixUnitaire.trim() == '') {
                prixUnitaire = 0;
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
            case "Monnaie":
                EtatCod = document.getElementById('code');
                break;
            case "Exercices":
                EtatCod = document.getElementById('annee');
                break;
            case "Articles":
                EtatCod = document.getElementById('disableEtat');
                break;
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
            code1: code1,
            code2: code2,
            niveau: pageName,
            statut: etat,

            annee: annee,
            Encours: EnCours,
            dateDebut: dateDebut,
            dateFin: dateFin,

            libelleM: nomM,
            valeur: nombre,
            reference: reference,
            prixUnitaire: prixUnitaire,
            codeBarre: codeBarre,
            unite: unite,
            observation: observation,
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
                                        case "Articles":
                                            var table = $('#' + pageName).DataTable();
                                            var codeArticle = $("#codeArticle").val()?.trim();

                                            table.rows().every(function () {
                                                var rowData = this.data();
                                                if (rowData[0].trim() === codeArticle) {
                                                    // Mise à jour des données dans le tableau
                                                    this.data([
                                                        rowData[0],        // codeArticle (inchangé)
                                                        libelle,           // libellé modifié
                                                        reference,         // référence modifiée
                                                        unite,             // unité modifiée
                                                        rowData[4],        // série (inchangé ici)
                                                        prixUnitaire,      // prix unitaire modifié
                                                        observation,       // observation modifiée
                                                        codeBarre          // code barre modifié
                                                    ]).draw(false); // mise à jour sans changer la pagination
                                                    return false; // sortir de la boucle
                                                }
                                            });
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
            var code = $("#code1 option:selected").text();
            nomTitre += "Magasin (" + code + ")";
            break;
        case "Articles":
            document.getElementById('disableEtat').disabled = false;
            var groupe = $("#code1 option:selected").text();
            var famille = $("#code2 option:selected").text();
            nomTitre += "Groupe (" + groupe + " " + famille + ")";
            
            document.getElementById('pdf_box').style.display = "none";
            const randomValue = generateRandomValue();
            $("#articleCodeBar").val(randomValue);
            var text = document.getElementById('articleCodeBar');
            genererCodeBar(text);
            var code1 = $("#code1").val();
            var code2 = $("#code2").val();
            numSerieArticle(pageName, code1, code2);
            break;
        case "Affectations":
            var site = $("#code1 option:selected").text();
            var magasin = $("#code2 option:selected").text();
            nomTitre += "Site (" + site + " " + magasin + ")";            
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
    resetForm();
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
            break;
        case "Exercices":
            code = $("#annee").val();
            nomTitre += "Exercice";
            break;
        case "Monnaie":
            code = $("#code").val();
            nomTitre += "Monnaie";
            break;
        case "Articles":
            code = $("#codeArticle").val();
            nomTitre += "Article";
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
        case "Articles":
            code = $("#codeArticle").val();
            break;
        default:
            code = $("#code").val();
    }
    var code1 = $("#code1").val();
    const objData = {
        code: code,
        code1: code1,
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
    var pageNameTitreController = $("#pageNameTitreController").val();
    var pageNameController = $("#pageNameController").val();
    var pageNameProjet = $("#pageNameProjet").val();
    var titre = $("#nameTitre");
    var FormHTML = "";
    switch (pageName) {
        case "Pays":
        case "unite":
        case "magasins":
        case "services":
        case "groupes":
        case "Exercices":
        case "Monnaie":
            FormHTML = `
                        <nav style="--phoenix-breadcrumb-divider: '&gt;&gt;';" aria-label="breadcrumb">
                          <ol class="breadcrumb mb-0">
                            <li class="breadcrumb-item">${pageNameController}</li>
                            <li class="breadcrumb-item active" aria-current="page">${pageNameProjet}</li>
                          </ol>
                        </nav>
                        `;
            break;
        case "Structures":
        case "Articles":
        case "Affectations":
            FormHTML = `
                        <nav style="--phoenix-breadcrumb-divider: '&gt;&gt;';" aria-label="breadcrumb">
                          <ol class="breadcrumb mb-0">
                            <li class="breadcrumb-item"><u>${pageNameTitreController}</u></li>
                            <li class="breadcrumb-item active" aria-current="page">${pageNameController}</li>
                            <li class="breadcrumb-item active" aria-current="page">${pageNameProjet}</li>
                          </ol>
                        </nav><br>
                        `;
            break;
    }
    titre.html(FormHTML);
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
        case "Articles":
        case "Affectations":
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
                    <div id="partieSite">
                    </div>
                    <div class="row mb-2 justify-content-center" style="text-align:center">
                        <div class="col-md-12">
                            <h4 id='messageStruct' style='color:red'></h4>
                        </div>
                    </div>
                    <div id="niveauImpression"></div>
                    <div id="niveauFormTableau"></div>                    
                    `;
            $("#formParam").append(formHTML);
            formTableTOP(pageName);
            formTableau(pageName);
            formPopup(pageName);
            formPopupParieSaisie(pageName);
            formDel();
            break;
    }
    loadData(pageName);
}
function formTableTOP(pageName) {
    let formHTML = "";
    switch (pageName) {
        case "magasins":
            formHTML = `
                    <div class="row">
                        <div class="col-md-2">
                            <label for="code1" id="labelCode1"></label>
                        </div>
                        <div class="col-md-4">
                            <select id="code1" style="width:100%" class="selectChoix">
                            </select>
                        </div>
                    </div>
                `;
            break;
        case "Articles":
        case "Affectations":
            formHTML = `
                    <div class="row">
                        <div class="col-md-2">
                            <label for="code1" id="labelCode1"></label>
                        </div>
                        <div class="col-md-4">
                            <select id="code1" style="width:100%" class="selectChoix">
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label for="code2" id="labelCode2"></label>
                        </div>
                        <div class="col-md-4">
                            <select id="code2" style="width:100%" class="selectChoix">
                            </select>
                        </div>
                    </div>
                `;
            break;
    }
    $("#partieSite").append(formHTML);
    switch (pageName) {
        case "magasins":
            document.getElementById('labelCode1').textContent = "Site";
            break;
        case "Articles":
            document.getElementById('labelCode1').textContent = "Groupe";
            document.getElementById('labelCode2').textContent = "Famille";
            break;
        case "Affectations":
            document.getElementById('labelCode1').textContent = "Site";
            document.getElementById('labelCode2').textContent = "Magasin";
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
        case "Articles":
            formHTML = `
                       <div class="row">
                            <div class="col-md-12">
                                <table class="table-bordered tabList" id="${pageName}" style="width:100%">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Libellé</th>
                                            <th>Référence</th>
                                            <th>Unité</th>
                                            <th hidden>Serie</th>
                                            <th hidden>prixUnitaire</th>
                                            <th hidden>observation</th>
                                            <th hidden>codeBarre</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                            </div>
                        </div> 
                    `;
            break;
        case "Affectations":
            formHTML = `
                       <div class="row">
                            <div class="col-md-12">
                                <table class="table-bordered tabList" id="${pageName}" style="width:100%">
                                    <thead>
                                        <tr>
                                            <th hidden>SITE</th>
                                            <th hidden>MAGASIN</th>
                                            <th>ARTICLES</th>
                                            <th>STOCK MINI</th>
                                            <th>STOCK MAXI</th>
                                            <th>QTE INITIALE</th>
                                            <th>PRIX UNITAIRE</th>
                                            <th>DERNIER PRIX</th>
                                            <th>VALEUR INITIALE</th>
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
        case "Articles":
        case "Affectations":
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
                            <div class="col-md-2">
                                <label for="code">Code</label>
                            </div>
                            <div class="col-md-4">
                                <input type="text" name="code" value="" id="code" class="input_focus" />
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
                                <input type="text" name="annee" value="" id="annee" class="input_focus"/>
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
                                <input type="text" name="code" value="" id="code" class="input_focus" />
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
                        <div id="partieBilletPiece" style="display:none">
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
                        </div>
                    `;
            break;
        case "Articles":
            formHTML = `
                        <input type='hidden' id="disableEtat">
                        <div class="row mb-1">
                            <div class="col-md-2">
                                <label for="serie">Série</label>
                            </div>
                            <div class="col-md-4">
                                <input type="text" name="serie" value="" id="serie" disabled class="input_focus"/>
                            </div>
                            <div class="col-md-2">
                                <label for="codeArticle">Code article</label>
                            </div>
                            <div class="col-md-4">
                                <input type="text" name="codeArticle" value="" id="codeArticle" disabled class="input_focus"/>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <div class="col-md-2">
                                <label for="libelle">Libellé</label>
                            </div>
                            <div class="col-md-7">
                                <input type="text" name="libelle" value="" id="libelle" class="input_focus" maxlength="250"/>
                                <span class='erreur'></span>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <div class="col-md-2">
                                <label for="reference">Référence</label>
                            </div>
                            <div class="col-md-7">
                                <input type="text" name="reference" value="" id="reference" class="input_focus" maxlength="50"/>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <div class="col-md-2">
                                <label for="unite">Unité</label>
                            </div>
                            <div class="col-md-5">
                                <select class="selectChoix input_focus" style="width:100%" id="unite" style="z-index:3500 !important;position: relative !important;">
                                    
                                </select>
                                <span class='erreur'></span>
                            </div>
                            <input type="hidden" id="articleCodeBar" />
                            <div class="col-md-5">
                                <div class="row justify-content-center" style="text-align:center">
                                    <div class="col-md-12">
                                        <div id="parent_box">
                                            <div id="box_">

                                            </div>
                                            <div id="box" style="width:100%;">
                                            </div>
                                        </div>
                                        <div id="pdf_box"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <div class="col-md-3">
                                <label for="prixUnitaire">Prix Unitaire</label>
                            </div>
                            <div class="col-md-3">
                                <input type="text" name="prixUnitaire" value="" maxlength="11" id="prixUnitaire" class="input_focus"/>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <div class="col-md-3">
                                <label for="observation">Observation</label>
                            </div>
                            <div class="col-md-6">
                                <input type="text" name="observation" value="" id="observation" class="input_focus"/>
                            </div>
                        </div>
                        `;
            break;
        case "Affectations":
            formHTML = `
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="row mb-1">
                                        <div class="col-md-2">
                                            <label for="article">Article</label>
                                        </div>
                                        <div class="col-md-4">
                                            <select class="selectChoix input_focus" id="article" style="width:100%;z-index:3500 !important;position: relative !important;">
                                            </select>
                                            <span class='erreur'></span>
                                        </div>
                                    </div>
                                    <div class="row mb-1">
                                        <div class="col-md-12">
                                            <h6><u>Prix /Stock</u></h6>
                                        </div>
                                    </div>
                                    <div class="row mb-1">
                                        <div class="col-md-6">
                                            <div class="row  mb-1">
                                                <div class="col-md-2">
                                                    <label for="stockMinium">Stock Minimum</label>
                                                </div>
                                                <div class="col-md-6">
                                                    <input type="text" name="stockMinium" value="0" id="stockMinium" class="input_focus valPrixStock" maxlength="12" />
                                                </div>
                                            </div>
                                            <div class="row  mb-1">
                                                <div class="col-md-2">
                                                    <label for="stockMaximum">Stock Maximum</label>
                                                </div>
                                                <div class="col-md-6">
                                                    <input type="text" name="stockMaximum" value="0" id="stockMaximum" class="input_focus valPrixStock" maxlength="12" />
                                                </div>
                                            </div>
                                            <div class="row  mb-1">
                                                <div class="col-md-2">
                                                    <label for="QteInitiale">Quantité Initiale</label>
                                                </div>
                                                <div class="col-md-6">
                                                    <input type="text" name="QteInitiale" value="0" id="QteInitiale" class="input_focus valPrixStock" maxlength="12" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="row  mb-1">
                                                <div class="col-md-2">
                                                    <label for="PrixUnitaire">Prix Unitaire</label>
                                                </div>
                                                <div class="col-md-6">
                                                    <input type="text" name="PrixUnitaire" value="0" id="PrixUnitaire" class="input_focus valPrixStock" maxlength="12" />
                                                </div>
                                            </div>
                                            <div class="row  mb-1">
                                                <div class="col-md-2">
                                                    <label for="dernierPrix">Dernier Prix</label>
                                                </div>
                                                <div class="col-md-6">
                                                    <input type="text" name="dernierPrix" value="0" id="dernierPrix" class="input_focus valPrixStock" maxlength="12" />
                                                </div>
                                            </div>
                                            <div class="row  mb-1">
                                                <div class="col-md-2">
                                                    <label for="ValInitiale">Valeur Initiale</label>
                                                </div>
                                                <div class="col-md-6">
                                                    <input type="text" name="ValInitiale" value="0" id="ValInitiale" class="input_focus valPrixStock" maxlength="12" />
                                                </div>
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
        case "Articles":
            code = document.getElementById('prixUnitaire');
            formatChiffreInput(code);
            separateur_mil(code);
            break;
        case "Affectations":
            document.querySelectorAll('.valPrixStock').forEach(function (input) {
                formatChiffreInput(input);
                separateur_mil(input);
            });
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
function genererPDF() {
    var fileName = "G1F1245"; // Si aucun nom n'est saisi, utiliser 'document' par défaut
    var options = {
        margin: 1,
        filename: fileName + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    var contenue = "G1F1245";
    $("#box_").append(contenue);
    html2pdf().from(document.getElementById('parent_box')).set(options).save();
    setTimeout(function () {
        $("#box_").empty();
    }, 10)
}
function generateRandomValue() {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = String(currentDate.getFullYear());
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    let randomValue = day + month + year + seconds;
    while (randomValue.length < 13) {
        randomValue += Math.floor(Math.random() * 10);
    }

    return randomValue;
}
function genererCodeBar(text) {
    //generer le code-barres
    var box = document.getElementById('box');
    box.innerHTML = "<svg id='barcode'></svg>";
    JsBarcode("#barcode", text.value);
    //box.style.width = '1px solid #999';
}
function numSerieArticle(pageName, code1, code2) {
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: {
            code: pageName,
            code1: code1,
            code2: code2,
        },
        url: '/CRUD/GetSerieArticle',
        success: function (data) {
            var serie = data.code;
            var groupe = $("#code1").val();
            var famille = $("#code2").val();
            var codeArticle = groupe + famille + serie;
            $("#codeArticle").val(codeArticle);
            $("#serie").val(serie);
        }
    })
}
function loadData(code) {
    var code1 = $("#code1").val();
    var code2 = $("#code2").val();
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: {
            code: code,
            code1: code1,
            code2: code2,
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
                let tableBody = $(`#${type}_${pageName} tbody`);

                if (tableBody.length > 0) {
                    tableBody.html(""); // Nettoyer le tbody avec une méthode plus sûre

                    if (data[type].length > 0) {
                        data[type].forEach((item, index) => {
                            let rowIndex = index + 1; // Index automatique si non fourni
                            let list = `<tr>
                                <td hidden>${item.code}</td>
                                <td style='text-align:right'>${item[`rowIndex${type.charAt(0)}`] || rowIndex}</td>
                                <td style='text-align:right'>${item.valeur}</td>
                            </tr>`;
                            tableBody.append(list);
                        });

                        // Sélectionner automatiquement la première ligne
                        tableBody.find("tr:first").addClass("selected");
                    }
                }
            });
        }
    });
}

function reportData(data) {
    if ($("#code1").val() == "" || $("#code1").val() == null) {
        $('#code1').empty();
        $.each(data.listDataSite, function (index, row) {
            $("#code1").append("<option value='" + row.code + "'>" + row.libelle + "</option>");
        })
    }
    if ($("#code2").val() == "" || $("#code2").val() == null) {
        $('#code2').empty();
        $.each(data.listDataSite2, function (index, row) {
            $("#code2").append("<option value='" + row.code + "'>" + row.libelle + "</option>");
        })
    }
    switch (pageName) {
        case "Articles":
        case "Affectations":
            if ($("#code1").val() == "" || $("#code1").val() == null || $("#code2").val() == "" || $("#code2").val() == null) {
                document.getElementById('Ajout').disabled = true;
            } else {
                document.getElementById('Ajout').disabled = false;
            }
            break;
    }
    if ($("#unite").val() == "" || $("#unite").val() == null) {
        $('#unite').empty();
        $("#unite").append("<option value='0'>---</option>")
        $.each(data.listDataUnite, function (index, row) {
            $("#unite").append("<option value='" + row.code + "'>" + row.libelle + "</option>");
        })
    }
    DataTable(pageName, data);
}
function DataTable(code, data) {
    var itemCode = data.listLengthCode[0];
    var countStruct = data.listLengthCode.length;

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
        },
        Articles: {
            columns: ["code", "libelle", "reference", "unite", "serie", "prixUnitaire", "observation", "codeBarre"],
            styles: {},
            hiddenCols: ["serie", "prixUnitaire", "observation", "codeBarre"]
        },
        Affectations: {
            columns: ["site", "magasin", "code", "stockMin", "stockMax", "QteInitiale", "prixUnitaire", "lastPrice", "valInitiale"],
            styles: {
                stockMin: "text-align: right;",
                stockMax: "text-align: right;",
                QteInitiale: "text-align: right;",
                prixUnitaire: "text-align: right;",
                lastPrice: "text-align: right;",
                valInitiale: "text-align: right;",
            },
            hiddenCols: ["site", "magasin"]
        }
    };

    switch (code) {
        case "Structures":
            var item = data.listData[0];
            $("#pays").val(item.pays);
            $("#monnaie").val(item.monnaie);
            $("#magasin").val(item.magasin);
            $("#groupe").val(item.groupe);
            $("#famille").val(item.famille);
            $("#service").val(item.service);
            $("#consommateur").val(item.consommateur);
            $("#unite").val(item.unite);
            $("#groupeFamille").val(item.codifArticle);
            $("#serie").val(item.serie);
            document.getElementById('checkAuto').checked = !!item.serieAUTO;
            document.getElementById('PrixMoyen').checked = !!item.pmp;
            document.getElementById('dernierPrix').checked = !item.pmp;

            document.querySelectorAll(".structCode").forEach(input => {
                formatChiffreInput(input);
                setMaxLength(input, 1);
            });
            break;
        default:
            if (code !== "Articles" && code !== "Affectations") {
                if (countStruct > 0) {
                    $('#Ajout').prop('disabled', false);
                    $('#Imprimer').prop('disabled', false);
                    $('#messageStruct').text("");
                    isEditing = false;
                } else {
                    $('#Ajout').prop('disabled', true);
                    $('#Imprimer').prop('disabled', true);
                    $('#messageStruct').html("Veuillez paramétrer la Structure des Codes <button class='btn btn-sm btn-warning' onclick='location.reload();' title='Actualiser'><i class='uil-refresh'></i></button>");
                    isEditing = true;
                }
            } 
            break;
    }


    $('#Imprimer').prop('disabled', data.listData.length === 0);
    if (data.listData.length === 0) {
        isEditing = true;
    } else {
        isEditing = false;
    }
    if ($.fn.DataTable.isDataTable('#' + code)) {
        $('#' + code).DataTable().destroy();
        $("#" + code + " tbody").empty();
    }

    // Déterminer les colonnes et styles
    const { columns, styles } = config[code] || config.default;
    const hiddenCols = config[code]?.hiddenCols || [];

    const columnDefs = hiddenCols.map(col => {
        const colIndex = columns.indexOf(col);
        return { targets: colIndex, visible: false };
    });

    function generateEtatCheckbox(status) {
        return `<input class="" disabled type="checkbox" ${status ? "checked" : ""} />`;
    }

    function generateRow(item, columns, styles) {
        return `<tr>` + columns.map(col => {
            let style = styles[col] ? ` style='${styles[col]}'` : "";
            let value = item[col] || "";
            if (col === "libelle" && value.length > 87) {
                let truncatedValue = value.substring(0, 87) + "...";
                return `<td${style} title="${value}" data-toggle="tooltip">${truncatedValue}</td>`;
            } else {
                return `<td${style}>${col === "statut" ? generateEtatCheckbox(value) : value}</td>`;
            }
        }).join('') + `</tr>`;
    }

    const rows = data.listData.map(item => generateRow(item, columns, styles)).join('');
    $("#" + code + " tbody").append(rows);

    $('#' + code).DataTable({
        "pageLength": 10,
        "lengthMenu": [[10, 50, 100, 150, 200, -1], [10, 50, 100, 150, 200, "Tous"]],
        "responsive": true,
        "lengthChange": true,
        "ordering": false,
        columnDefs: columnDefs,
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

    $("#" + pageName).removeClass("dataTable");
    $('[data-toggle="tooltip"]').tooltip();

    var codeLength = document.getElementById("code");
    var tailleCode = 0;
    switch (code) {
        case "Pays":
            tailleCode = parseInt(itemCode.pays);
            break;
        case "services":
            tailleCode = parseInt(itemCode.service);
            break;
        case "groupes":
            tailleCode = parseInt(itemCode.groupe);
            break;
        case "unite":
            tailleCode = parseInt(itemCode.unite);
            break;
        case "magasins":
            tailleCode = parseInt(itemCode.magasin);
            break;
        case "Exercices":
            codeLength = document.getElementById("annee");
            tailleCode = 4;
            break;
        case "Monnaie":
            tailleCode = parseInt(itemCode.monnaie);
            break;
    }
    if (codeLength && tailleCode > 0) {
        setMaxLength(codeLength, tailleCode);
    }
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
                    isDelete = false;
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
                isDelete = true;
                let code = selectedRow.cells[0].textContent.trim(); // Récupérer code
                let valeur = selectedRow.cells[2].textContent.trim(); // Récupérer Valeur
                let tableId = selectedRow.closest("table")?.id || "ID introuvable";
                CRUDMonnaie(tableId, valeur)
                selectedRow.remove();
                //console.log(`Ligne avec code ${code} supprimée.`);
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
                    CRUDMonnaie(tableId, newValue);
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
function CRUDMonnaie(tabID, value) {
    var codeM = $("#code").val();
    const objData = {
        code: codeM,
        tabID: tabID,
        valeur: value,
        statut: isDelete //Suppression active ou desactive
    }
    $.ajax({
        url: "/CRUD/CRUDMonnaie",
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
            document.getElementById('code').disabled = false;
            break;
        case "Exercices":
            document.getElementById('annee').disabled = false;
            $('.DateSaisie').val('').attr('type', 'text').attr('type', 'date');
            $("#ControleDateSup").html('');
            break;
        case "Monnaie":
            document.getElementById('code').disabled = false;
            document.getElementById('partieBilletPiece').style.display = "none";
            $("#Billet_" + pageName + " tbody").empty();
            $("#Piece_" + pageName + " tbody").empty();
            break;
        case "Articles":
            $("#unite").val(0).trigger('change');
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
function setMaxLength(input, length) {
    input.addEventListener('input', function () {
        if (this.value.length > length) {
            this.value = this.value.substring(0, length); // Coupe le texte à la longueur maximale
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