var pageName = $("#pageName").val();

$(function () {
    vuePage();
})
var Consulter = function () {
    var isAllValid = true;
    var exercice = null, numBon = null, numBL = null, dateS = null,
        compte = null, compteAux = null;
    exercice = $("#exercice").val();
    switch (pageName) {
        case "EntreeStock":
            numBon = $("#numBon").val();
            numBL = $("#numBL").val();
            dateS = $("#dateSaisie").val();
            compte = $("#compte").val();
            compteAux = $("#compteAux").val();
            if (exercice == 0 || exercice == null) {
                isAllValid &= validateRequired("#exercice", "champ obligatoire");
            }
            if (numBon.trim() == '') {
                isAllValid &= validateRequired("#numBon", "champ obligatoire");
            }
            if (numBL.trim() == '') {
                isAllValid &= validateRequired("#numBL", "champ obligatoire");
            }
            if (dateS.trim() == '') {
                isAllValid &= validateRequired("#dateSaisie", "champ obligatoire");
            } else {
                const endDateD = document.getElementById('dateSaisie').value;

                const yearD = endDateD.split('-')[0];
                // Vérifier si l'année a 4 caractères
                if (yearD.length === 4 && !isNaN(yearD)) {
                    const selectedOption = $("#exercice option:selected");

                    const dateDebutStr = selectedOption.data("code");    // Ex: "01/01/2024"
                    const dateFinStr = selectedOption.data("code2");     // Ex: "31/12/2024"
                    const dateSaisieStr = $("#dateSaisie").val();                 // Format : "2024-05-10" (valeur input type="date")

                    // Convertir en format Date pour comparaison
                    const [jourDebut, moisDebut, anneeDebut] = dateDebutStr.split("/");
                    const [jourFin, moisFin, anneeFin] = dateFinStr.split("/");

                    const dateDebut = new Date(`${anneeDebut}-${moisDebut}-${jourDebut}`);
                    const dateFin = new Date(`${anneeFin}-${moisFin}-${jourFin}`);
                    const dateSaisie = new Date(dateSaisieStr);

                    // Comparaison
                    if (dateSaisie >= dateDebut && dateSaisie <= dateFin) {
                        //alert('Success')
                    } else {
                        isAllValid = false;
                        $("#dateSaisie").siblings('span.erreur').html("❌ La date du mouvement doit être comprise entre : " + dateDebutStr + " au " + dateFinStr+"").css('display', 'block');

                    }
                } else {
                    isAllValid = false;
                    $("#dateSaisie").siblings('span.erreur').html("Revoir l\'année.").css('display','block');
                }

            }
            if (compte == "0" || compte == null) {
                isAllValid = false;
                $("#compte").siblings('span.erreur').html('champ obligatoire').css('display', 'block');
            }
            if (compteAux == "0" || compteAux == null) {
                isAllValid = false;
                $("#compteAux").siblings('span.erreur').html('champ obligatoire').css('display', 'block');
            }
            break;
    }
    if (isAllValid) {
        formContentVue2();
    }
}
function vuePage() {
    var pageNameTitreController = $("#pageNameTitreController").val();
    var pageNameController = $("#pageNameController").val();
    var pageNameProjet = $("#pageNameProjet").val();
    var titre = $("#nameTitre");
    var FormHTML = "";
    switch (pageName) {
        case "EntreeStock":
        case "SortieStock":
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
    formContentVue();
}
function formContentVue() {
    let formHTML = "";
    $("#partieDefaut").empty();
    switch (pageName) {
        case "EntreeStock":
        case "SortieStock":
            formHTML = `
                        <div class="row justify-content-center" style="text-align:center">
                            <div class="col-md-10 pageView" style="border:1px solid #c2bdbd;border-radius:5px">
                                <div class="row mb-2">
                                    <div class="col-md-3">
                                        <label for="exercice">Exercice</label>
                                    </div>
                                    <div class="col-md-4">
                                        <select id="exercice" class="input_focus selectChoix" style="width:100%">
                                        </select>
                                        <span class="erreur"></span>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-md-3">
                                        <label for="numBon">No Bon</label>
                                    </div>
                                    <div class="col-md-4">
                                        <input type="text" name="numBon" value="" id="numBon" class="input_focus"/>
                                        <span class="erreur"></span>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-md-3">
                                        <label for="numBL">No BL</label>
                                    </div>
                                    <div class="col-md-4">
                                        <input type="text" name="numBL" value="" id="numBL" class="input_focus"/>
                                        <span class="erreur"></span>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-md-3">
                                        <label for="dateSaisie">Date</label>
                                    </div>
                                    <div class="col-md-9">
                                        <input type="date" name="dateSaisie" value="" id="dateSaisie" class="input_focus"/>
                                        <span class="erreur"></span>
                                    </div>
                                </div>
                                <div class="row mb-1 justify-content-start" style="text-align:left">
                                    <div class="col-md-12">
                                        <strong><u>Fournisseur</u></strong>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-md-3">
                                        <label for="compte">Compte</label>
                                    </div>
                                    <div class="col-md-9">
                                        <select id="compte" class="input_focus selectChoix" style="width:100%">
                                        </select>
                                        <span class="erreur"></span>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-md-3">
                                        <label for="compteAux">Compte auxiliaire</label>
                                    </div>
                                    <div class="col-md-9">
                                        <select id="compteAux" class="input_focus selectChoix" style="width:100%">
                                        </select>
                                        <span class="erreur"></span>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-12">
                                        <button class="btn btn-sm btn-primary" onclick="Consulter()" id="Consulter">Consulter</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
            break;
    }
    $("#partieDefaut").append(formHTML);
    toggleForms("partieDefaut");
    $(".selectChoix").select2();
    loadDataVue1();
    $("#compte").change(function () {
        loadDataVue1();
    })
    $('.input_focus').change(function () {
        $(this).siblings('span.erreur').css('display', 'none');
    })
    $('.input_focus').keyup(function () {
        $(this).siblings('span.erreur').css('display', 'none');
    })
}
function formContentVue2() {
    let formHTML = "";
    $("#partieRemplir").empty();
    switch (pageName) {
        case "EntreeStock":
        case "SortieStock":
            formHTML = `
                        <div class="row justify-content-center" style="text-align:center">
                                    <div class="col-md-12">
                                        <div class="row">
                                            <div class="col-md-12">
                                                <div class="float-start">
                                                    <strong id="titreStock"></strong>
                                                </div>
                                                <div class="float-end">
                                                    <button class="btn btn-sm btn-danger" id="fermer">&times;Fermer</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row justify-content-start" style="text-align:left;padding-top:10px">
                                            <div class="col-md-5" style="border:1px solid #c1baba;border-radius:5px 0 0 5px;padding-top:8px">
                                                <div class="row mb-1">
                                                    <div class="col-md-12">
                                                        <strong>Exercice :</strong>&nbsp;&nbsp;<span id="valExercice"></span>
                                                    </div>
                                                </div>
                                                <div class="row mb-1">
                                                    <div class="col-md-12">
                                                        <strong>No Bon :</strong>&nbsp;&nbsp;<span id="valBon"></span>
                                                    </div>
                                                </div>
                                                <div class="row mb-1">
                                                    <div class="col-md-12">
                                                        <strong>No BL :</strong>&nbsp;&nbsp;<span id="valBL"></span>
                                                    </div>
                                                </div>
                                                <div class="row mb-1">
                                                    <div class="col-md-12">
                                                        <strong>Date :</strong>&nbsp;&nbsp;<span id="valDate"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-7" style="border:1px solid #c1baba;border-left:none;border-radius:0 5px 5px 0;padding-top:8px">
                                                <div class="row mb-1">
                                                    <div class="col-md-12">
                                                        <strong>Compte :</strong>&nbsp;&nbsp;<span id="valCompte"></span>
                                                    </div>
                                                </div>
                                                <div class="row mb-1">
                                                    <div class="col-md-12">
                                                        <strong>Compte auxiliaire :</strong>&nbsp;&nbsp;<span id="valCompteAuxi"></span>
                                                    </div>
                                                </div>
                                                <div class="row mb-1">
                                                    <div class="col-md-3">
                                                        <label for="site1">Site</label>
                                                    </div>
                                                    <div class="col-md-9">
                                                        <select id="site1" class="input_focus selectChoix" style="width:100%">
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="row mb-1">
                                                    <div class="col-md-3">
                                                        <label for="site2">Magasin</label>
                                                    </div>
                                                    <div class="col-md-9">
                                                        <select id="site2" class="input_focus selectChoix" style="width:100%">
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row" style="padding-top:8px">
                                            <div class="col-md-12" style="max-height: 300px; overflow-y: auto">
                                                <table class="tabList" style="width:100%">
                                                    <thead class="sticky-top" id="tab_">
                                                        <tr>
                                                            <th>Article</th>
                                                            <th>Libellé</th>
                                                            <th>PU</th>
                                                            <th>Qte</th>
                                                            <th>Valeur</th>
                                                            <th>TVA</th>
                                                            <th>Montant Hors TVA</th>
                                                            <th>Montant TVA</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody></tbody>
                                                    <tfoot></tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        `;
            break;
    }
    $("#partieRemplir").append(formHTML);
    toggleForms("partieRemplir");
    ContentInputButton();
    var exercice = null, numBon = null, numBL = null, dateS = null,
        compte = null, compteAux = null;
    switch (pageName) {
        case "EntreeStock":
            exercice = separateur_mil($("#exercice").val());
            numBon = $("#numBon").val();
            numBL = $("#numBL").val();
            dateS = afficherDateddMMyyyy($("#dateSaisie").val());
            compte = $("#compte option:selected").text();
            compteAux = $("#compteAux option:selected").text();

            document.getElementById('valExercice').textContent = exercice;
            document.getElementById('valBon').textContent = numBon;
            document.getElementById('valBL').textContent = numBL;
            document.getElementById('valDate').textContent = dateS;

            document.getElementById('valCompte').textContent = compte;
            document.getElementById('valCompteAuxi').textContent = compteAux;
            break;
    }
}
function ContentInputButton() {
    $("#fermer").click(function () {
        formContentVue();
    })
    $('.input_focus').change(function () {
        $(this).siblings('span.erreur').css('display', 'none');
    })
    $('.input_focus').keyup(function () {
        $(this).siblings('span.erreur').css('display', 'none');
    })
}
function toggleForms(showId) {
    // Liste des IDs des formulaires
    let forms = ["partieDefaut", "partieRemplir"];
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
    if (!nStr || isNaN(nStr)) return nStr;
    nStr = nStr.toString();
    let [x1, x2 = ""] = nStr.split('.');
    x2 = x2 ? '.' + x2 : '';
    const rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ' ' + '$2');
    }
    return x1 + x2;
}
function loadDataVue1() {
    var compte = $("#compte").val();
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: {
            page: pageName,
            compte: compte
        },
        url: '/CRUD/GetEntreeSortie',
        success: function (data) {
            if ($("#exercice").val() == "" || $("#exercice").val() == null) {
                $('#exercice').empty();
                let defaultValue = null;
                $.each(data.exercice, function (index, row) {
                    let option = $("<option>", {
                        value: row.annee,
                        name: row.statut,
                        text: row.annee,
                        'data-code': row.dateDebut,
                        'data-code2': row.dateFin
                    });


                    if (row.statut === true || row.statut === "true") {
                        defaultValue = row.annee;
                    }

                    $("#exercice").append(option);
                });

                if (defaultValue !== null) {
                    $("#exercice").val(defaultValue);
                }
            }

            if ($("#compte").val() == "" || $("#compte").val() == null) {
                $('#compte').empty();
                $.each(data.compte, function (index, row) {
                    $("#compte").append("<option value='" + row.code + "'>" + row.code + " | " + row.libelle + "</option>");
                })
            }
            $('#compteAux').empty();
            $("#compteAux").append("<option value='0'></option>")
            $.each(data.compteAuxi, function (index, row) {
                $("#compteAux").append("<option value='" + row.code + "'>" + row.code + " | " + row.libelle + "</option>");
            })
        }
    });
}
function setErrorMessage(selector, message, isValid) {
    if (!isValid) {
        $(selector).siblings('span.erreur').html(message).css('display', 'block');
    } else {
        $(selector).siblings('span.erreur').css('display', 'none');
    }
}
function validateRequired(selector, message) {
    const val = $(selector).val()?.trim();
    if (!val) {
        setErrorMessage(selector, message, false);
        return false;
    } else {
        $(selector).siblings('span.erreur').css('display', 'none');
        return true;
    }
}

