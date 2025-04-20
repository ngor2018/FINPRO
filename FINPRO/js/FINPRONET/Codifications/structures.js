var isEditing = false;
var pageName = $("#pageName").val();
parameter();
var IDButton = null;

var Ajouter = function () {
    var selectButton = document.getElementById('Ajouter');
    //document.getElementById('niveau').disabled = false;
    switch (selectButton.textContent) {
        case "Ajouter":
            document.getElementById('Ajouter').textContent = "Enregistrer";

            document.getElementById('Modifier').disabled = true;
            document.getElementById('Supprimer').disabled = true;
            document.getElementById('closeSt').disabled = true;
            document.getElementById('Imprimer').disabled = true;

            document.getElementById('Annuler').disabled = false;
            $(".disabled_me").prop("disabled", false);
            document.getElementById('niveau').disabled = true;
            resetForm();
            $("#libelle").focus();
            break;
        case "Enregistrer":
            var isAllValid = true;
            var niveau = $("#niveau").val();
            var libelle = $("#libelle").val();
            var abreviation = $("#abreviation").val();
            var format = $("#format").val();
            var titre = $("#titre").val();
            var abreviationTitre = $("#abreviationTitre").val();
            var PlanCorrespond = $("#PlanCorrespond").val();
            if (libelle.trim() == '') {
                isAllValid = false;
                $("#libelle").siblings('span.erreur').html('champ obligatoire').css('display', 'block');
            }
            if (abreviation.trim() == '') {
                isAllValid = false;
                $("#abreviation").siblings('span.erreur').html('champ obligatoire').css('display', 'block');
            }
            if (format.trim() == '') {
                isAllValid = false;
                $("#format").siblings('span.erreur').html('champ obligatoire').css('display', 'block');
            } else {
                let input = document.getElementById('format').value;
                let isValid = false;
                let formatType = "";
                var totalForm = $("#totalForm").val();
                // Vérifier si la chaîne ne contient que des 'A', '9' ou 'C' et qu'ils sont tous du même type
                if (/^A+$/.test(input.trim())) {
                    formatType = "Alphabétique";
                    isValid = true;
                } else if (/^9+$/.test(input.trim())) {
                    formatType = "Numérique";
                    isValid = true;
                } else if (/^C+$/.test(input.trim())) {
                    formatType = "AlphaNumérique";
                    isValid = true;
                }
                if (!isValid) {
                    isAllValid = false;
                    $("#format").siblings('span.erreur').html("Format invalide ! Utilisez uniquement 'A', '9' ou 'C' sans mélange.").css('display', 'block');
                } else {
                    if (input.length > totalForm) {
                        isAllValid = false;
                        $("#format").siblings('span.erreur').html("Vous avez le maximum de niveaux gérés").css('display', 'block');
                    }
                }
            }
            if (isAllValid) {
                alert('Mario')
            }
            break;
    }
}
var Annuler = function () {
    isEditing = false;
    GedData(IDButton);
    $(".disabled_me").prop("disabled", true);
    $(".input_focus").siblings('span.erreur').css('display', 'none');
}
function parameter() {
    var pageNameTitreController = $("#pageNameTitreController").val();
    var pageNameController = $("#pageNameController").val();
    var pageNameProjet = $("#pageNameProjet").val();
    var titre = $("#nameTitre");
    switch (pageName) {
        case "Structures":
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
    document.querySelectorAll(".btn").forEach(button => {
        button.addEventListener("click", function () {
            var button = this.id;
            switch (button) {
                case "StructPlanBudget":
                case "StructPlanCompt":
                case "StructActivite":
                case "StructZone":
                case "StructEmplacements":
                case "StructPlanExtP1":
                case "StructPlanExtP2":
                case "StructPlanExtP3":
                case "StructPlanExtP4":
                    $("#nameIDButton").val(this.id);
                    IDButton = this.id;
                    formPopup(this.id);
                    break;
            }
        });
    });
}
function ControleinputSaisie() {
    $("#closeSt").click(function () {
        document.getElementById('fullscreen_popup').style.display = "none";
    })
    $('.input_focus').keyup(function () {
        $(this).siblings('span.erreur').css('display', 'none');
    })
    $("#format").keyup(function () {
        this.value = this.value.toUpperCase();
    })
    $('.choixSelect').select2();
    $("#tab_" + IDButton + " tbody").on("click", "tr", function () {
        //if (isEditing) return; // Désactiver si en mode édition
        $(this).toggleClass("selected").siblings(".selected").removeClass("selected");
        var niveau = "", libelle = "", abreviation = "", format = "", titre = "", abreviationTitre = "", PlanCorrespond = "";
        niveau = this.cells[0].innerHTML;
        libelle = this.cells[1].innerHTML;
        abreviation = this.cells[2].innerHTML;
        format = this.cells[3].innerHTML;
        $("#niveau").val(niveau);
        $("#libelle").val(libelle);
        $("#abreviation").val(abreviation);
        $("#format").val(format);
        switch (IDButton) {
            case "StructPlanBudget":
                titre = this.cells[4].innerHTML;
                abreviationTitre = this.cells[5].innerHTML;
                $("#titre").val(titre);
                $("#abreviationTitre").val(abreviationTitre);
                break;
        }
    })
}
function formPopup(id) {
    let container = document.getElementById('partieStructurePlan');
    container.innerHTML = "";
    toggleForms("partieStructurePlan");
    var tailleFormat = 0;
    switch (id) {
        case "StructPlanBudget":
        case "StructZone":
        case "StructPlanCompt":
        case "StructEmplacements":
        case "StructPlanExtP1":
        case "StructPlanExtP2":
        case "StructPlanExtP3":
        case "StructPlanExtP4":
            tailleFormat = 10;
            break;
        case "StructActivite":
            tailleFormat = 12;
            break;
    }
    let formHTML = `
            <div class="row justify-content-center" style="padding-top:8%">
                <div class="col-md-8 pageView">
                    <div class="row">
                        <div class="col-md-12" style="padding-bottom: 10px;border-bottom:1px solid #bdb8b8">
                            <div class="float-start">
                                <strong id="titleStruct"></strong>
                            </div>
                        </div>
                    </div>
                    <div class="form_padd">
                        <div class="row">
                            <div class="col-md-12">
                                <div class="row">
                                    <div class="col-md-3">
                                        <label for="niveau">Niveau</label>
                                    </div>
                                    <div class="col-md-2">
                                        <input type="text" name="niveau" value="" id="niveau" class=" input_focus disabled_me" />
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-3">
                                        <label for="libelle">Libellé</label>
                                    </div>
                                    <div class="col-md-9">
                                        <input type="text" name="libelle" value="" id="libelle" class=" input_focus disabled_me" />
                                        <span class="erreur"></span>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-3">
                                        <label for="abreviation">Abréviation</label>
                                    </div>
                                    <div class="col-md-9">
                                        <input type="text" name="abreviation" value="" id="abreviation" class=" input_focus disabled_me" />
                                        <span class="erreur"></span>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-3">
                                        <label for="format">Format</label>
                                    </div>
                                    <div class="col-md-9">
                                        <input type="text" name="format" value="" id="format" class=" input_focus disabled_me" maxlength="${tailleFormat}" />
                                        <span class="erreur"></span>
                                    </div>
                                </div>
                                <div id="partieAbreTitre">
                                    
                                </div>
                                <div id="partiePlanCorrespond">
                                    
                                </div>
                            </div>
                        </div>
                        <div class="row justify-content-right" style="padding-top:10px;text-align:right">
                            <div class="col-md-12">
                                <button class="btn btn-secondary btn-sm" type="button" id="Imprimer" onclick="Imprimer()">Imprimer</button>
                                <button class="btn btn-secondary btn-sm" type="button" id="Ajouter" onclick="Ajouter()">Ajouter</button>
                                <button class="btn btn-secondary btn-sm" type="button" id="Modifier" onclick="Modifier()">Modifier</button>
                                <button class="btn btn-danger btn-sm" type="button" id="Supprimer" onclick="Supprimer()">Supprimer</button>
                                <button class="btn btn-danger btn-sm" type="button" id="Annuler" onclick="Annuler()">Annuler</button>
                                <button class="btn btn-danger btn-sm" type="button" id="closeSt">Fermer</button>
                            </div>
                        </div>
                        <div id="partieTab">
                            
                        </div>
                        <div class="row justify-content-center" style="text-align:center;padding-top:20px">
                            <div class="col-md-12" style="background-color:#0094ff;color:#fff">
                                <strong>Format : 9=Numérique;A=Alphabétique;C=AlphaNumérique</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    container.insertAdjacentHTML("beforeend", formHTML);
    switch (id) {
        case "StructPlanBudget":
        case "StructZone":
        case "StructActivite":
            formPopupAbreTitre(id);
            formPopupTab(id);
            break;
        case "StructPlanCompt":
        case "StructEmplacements":
            formPopupTabPlan_Empl(id);
            break;
        case "StructPlanExtP1":
        case "StructPlanExtP2":
        case "StructPlanExtP3":
        case "StructPlanExtP4":
            formPopupAbreTitre(id);
            formPopupPlanCorresp(id);
            formPopupTabFamily_P(id);
            break;
    }
    GedData(id);
    ControleinputSaisie();
}
function formPopupAbreTitre(id) {
    let container = document.getElementById('partieAbreTitre');
    container.innerHTML = "";
    let formHTML = `
                <div class="row">
                    <div class="col-md-3">
                        <label for="titre">Titre</label>
                    </div>
                    <div class="col-md-9">
                        <input type="text" name="titre" value="" id="titre" class=" input_focus disabled_me" />
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-3">
                        <label for="abreviationTitre">Abréviation Titre</label>
                    </div>
                    <div class="col-md-9">
                        <input type="text" name="abreviationTitre" value="" id="abreviationTitre" class=" input_focus disabled_me" />
                    </div>
                </div>
            `;
    container.insertAdjacentHTML("beforeend", formHTML);
}
function formPopupPlanCorresp(id) {
    let container = document.getElementById('partiePlanCorrespond');
    container.innerHTML = "";
    let formHTML = `
                    <div class="row">
                        <div class="col-md-3">
                            <label for="PlanCorrespond">Plan Correspondant</label>
                        </div>
                        <div class="col-md-9">
                            <select class="input_focus choixSelect disabled_me" style="width:100%" id="PlanCorrespond">
                            </select>
                        </div>
                    </div>
                `;
    container.insertAdjacentHTML("beforeend", formHTML);
}
function formPopupTab(id) {
    let container = document.getElementById('partieTab');
    container.innerHTML = "";
    let formHTML = `
                    <div class="row">
                        <div class="col-md-12" style="max-height: 200px; overflow-y: auto">
                            <table class="table-bordered tabList" id="tab_${id}" width="100%">
                                <thead class="sticky-top bg-white">
                                    <tr>
                                        <th>Niveau</th>
                                        <th>Libellé</th>
                                        <th>Abréviation</th>
                                        <th>Format</th>
                                        <th hidden>titre</th>
                                        <th hidden>Abre titre</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
    container.insertAdjacentHTML("beforeend", formHTML);
}
function formPopupTabPlan_Empl(id) {
    let container = document.getElementById('partieTab');
    container.innerHTML = "";
    let formHTML = `
                    <div class="row">
                        <div class="col-md-12" style="max-height: 200px; overflow-y: auto">
                            <table class="table-bordered tabList" id="tab_${id}" width="100%">
                                <thead class="sticky-top bg-white">
                                    <tr>
                                        <th>Niveau</th>
                                        <th>Libellé</th>
                                        <th>Abréviation</th>
                                        <th>Format</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
    container.insertAdjacentHTML("beforeend", formHTML);
}
function formPopupTabFamily_P(id) {
    let container = document.getElementById('partieTab');
    container.innerHTML = "";
    let formHTML = `
            <div class="row">
                <div class="col-md-12" style="max-height: 200px; overflow-y: auto">
                    <table class="table-bordered tabList" id="tab_${id}" width="100%">
                        <thead class="sticky-top bg-white">
                            <tr>
                                <th>Niveau</th>
                                <th>Libellé</th>
                                <th>Abréviation</th>
                                <th>Format</th>
                                <th hidden>titre</th>
                                <th hidden>Abre titre</th>
                                <th hidden>Plan Corresp</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    container.insertAdjacentHTML("beforeend", formHTML);
}
function GedData(id) {
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: {
            id: id,
        },
        url: '/FINPRO_Codifications/GetListDataStruct',
        success: function (data) {
            document.getElementById('Ajouter').textContent = "Ajouter";
            document.getElementById('closeSt').disabled = false;
            document.getElementById('Annuler').disabled = true;
            $("#contentTab tbody").empty();
            if (data.listData.length == 0) {
                document.getElementById('Ajouter').disabled = false;
                document.getElementById('Imprimer').disabled = true;
                document.getElementById('Modifier').disabled = true;
                document.getElementById('Supprimer').disabled = true;

                resetForm();
            } else {
                var list = "";
                $("#tab_" + id + " tbody").empty();
                switch (id) {
                    case "StructPlanBudget":
                        document.getElementById('Ajouter').disabled = false;
                        /*if (data.total > 0) {
                            document.getElementById('Ajouter').disabled = true;
                        } else {
                            document.getElementById('Ajouter').disabled = false;
                        }*/
                        data.listData.forEach(item => {
                            list = `
                                <tr>
                                    <td>${item.niveau}</td>
                                    <td>${item.libelle}</td>
                                    <td>${item.abreviation}</td>
                                    <td style='text-align:right'>${item.format}</td>
                                    <td hidden>${item.titre}</td>
                                    <td hidden>${item.abreviationTitre}</td>
                                </tr>`;
                            $("#tab_" + id + " tbody").append(list);
                        });
                        break;
                }
                var table = document.getElementById("tab_" + id);
                if (table && table.tBodies[0].rows.length > 0) {
                    var firstRow = table.tBodies[0].rows[0];
                    var niveau = "", libelle = "", abreviation = "", format = "", titre = "", abreviationTitre = "";
                    niveau = firstRow.cells[0].textContent.trim();
                    libelle = firstRow.cells[1].textContent.trim();
                    abreviation = firstRow.cells[2].textContent.trim();
                    format = firstRow.cells[3].textContent.trim();
                    $("#niveau").val(niveau);
                    $("#libelle").val(libelle);
                    $("#abreviation").val(abreviation);
                    $("#format").val(format);
                    switch (id) {
                        case "StructPlanBudget":
                            titre = firstRow.cells[4].textContent.trim();
                            abreviationTitre = firstRow.cells[5].textContent.trim();

                            $("#titre").val(titre);
                            $("#abreviationTitre").val(abreviationTitre);
                            if (titre == '') {
                                document.getElementById('titleStruct').textContent = "Structure Plan Budgétaire";
                            } else {
                                document.getElementById('titleStruct').textContent = titre;
                            }
                            break;
                    }
                    $(firstRow).addClass("selected").siblings().removeClass("selected");

                }
                compterCaracteresColums(id);
                document.getElementById('Imprimer').disabled = false;
                document.getElementById('Modifier').disabled = false;
                document.getElementById('Supprimer').disabled = false;
            }
            $(".disabled_me").prop("disabled", true);
        }
    })
}
function compterCaracteresColums(tab) {
    let totalCaracteres = 0;
    let tableau = document.getElementById("tab_" + tab);

    // Boucle sur toutes les lignes du tbody (évite le thead)
    for (let i = 1; i < tableau.rows.length; i++) {
        let formatCell = tableau.rows[i].cells[3]; // 4e colonne (index 2)
        let formatText = formatCell.textContent.trim(); // Récupérer le texte sans espace
        totalCaracteres += formatText.length; // Ajouter la longueur au total
    }

    // Afficher le résultat
    $("#totalForm").val(totalCaracteres);
}
function resetForm() {
    $(".input_focus").val('');
    $('.input_focus').siblings('span.erreur').css('display', 'none');
}
function toggleForms(showId) {
    // Liste des IDs des formulaires
    let forms = ["partieStructurePlan", ""];
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