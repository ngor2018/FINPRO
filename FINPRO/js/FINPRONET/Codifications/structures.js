var isEditing = false, CheckFirstLine = false;
var pageName = $("#pageName").val();
var totalPost = 0;
GetNameButtonCodif();
parameter();
var IDButton = null;

var Ajouter = function () {
    var selectButton = document.getElementById('Ajouter');
    if (totalPost > 0) {
        document.getElementById('errorCRUD').textContent = "Vous ne pouvez plus créer de niveaux, des codes ont été déjà saisis";
        setTimeout(function () {
            document.getElementById('errorCRUD').textContent = "";
        },2500)
        return;
    }
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
            resetForm();
            mettreAJourNiveau();
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
var Modifier = function () {
    document.getElementById('Ajouter').textContent = "Enregistrer";

    document.getElementById('Modifier').disabled = true;
    document.getElementById('Supprimer').disabled = true;
    document.getElementById('closeSt').disabled = true;
    document.getElementById('Imprimer').disabled = true;

    document.getElementById('Annuler').disabled = false;

    document.getElementById('libelle').disabled = false;
    document.getElementById('abreviation').disabled = false;
    document.getElementById('format').disabled = false;
    if (CheckFirstLine == true) {
        //✅ Première ligne sélectionnée !";
        switch (IDButton) {
            case "StructPlanBudget":
            case "StructActivite":
            case "StructZone":
            case "StructPlan6":
                document.getElementById('titre').disabled = false;
                document.getElementById('abreviationTitre').disabled = false;
                break;
        }
    } else {
        switch (IDButton) {
            case "StructPlanBudget":
            case "StructActivite":
            case "StructZone":
            case "StructPlan6":
                document.getElementById('titre').disabled = true;
                document.getElementById('abreviationTitre').disabled = true;
                break;
        }
    } 
    if (totalPost > 0) {
        switch (IDButton) {
            case "StructPlanCompt":
            case "StructPlanBudget":
            case "StructActivite":
            case "StructZone":
            case "StructPlan6":
            case "StructEmplacements":
                document.getElementById('format').disabled = true;
                break;
        }
    }
}
var Supprimer = function () {
    if (totalPost > 0) {
        document.getElementById('errorCRUD').textContent = "Vous ne pouvez plus supprimer de niveaux, des codes ont été déjà saisis";
        setTimeout(function () {
            document.getElementById('errorCRUD').textContent = "";
        }, 2500)
        return;
    }
    const table = document.getElementById("tab_" + IDButton);
    const selectedRow = table.querySelector("tbody tr.selected"); // suppose que la ligne sélectionnée a une classe `selected`

    if (!selectedRow) {
        alert("Veuillez sélectionner une ligne à supprimer.");
        return;
    }

    const niveauSelectionne = parseInt(selectedRow.cells[0].textContent.trim(), 10);
    const lignes = Array.from(table.querySelectorAll("tbody tr"));

    const index = lignes.findIndex(row => row === selectedRow);

    const aPrecedent = index > 0;
    const aSuivant = index < lignes.length - 1;

    //if (aPrecedent || aSuivant) {
    if (aSuivant) {
        //alert("Suppression impossible, ce niveau a un Précédent ou / et un Suivant.");
        alert("Suppression impossible, ce niveau a un Suivant.");
        return;
    }

    // Suppression possible
    //selectedRow.remove();
    toggleForms("partieDelete");
    var niveau = $("#niveau").val();
    document.getElementById('titreDel').textContent = "Suppresssion";
    $("#messageDel").html("Voulez-vous supprimer Niveau <strong>" + niveau + "</strong>");
}
var closeDel = function () {
    toggleForms("partieStructurePlan");
    $("#errorCodif").html('');
}
var Annuler = function () {
    isEditing = false;
    GedData(IDButton);
    $(".disabled_me").prop("disabled", true);
    $(".input_focus").siblings('span.erreur').css('display', 'none');
    switch (IDButton) {
        case "StructPlanExtP1":
        case "StructPlanExtP2":
        case "StructPlanExtP3":
        case "StructPlanExtP4":
            $("#PlanCorrespond").val(0).trigger('change');
            break;
    }
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
                case "StructPlan6":
                case "StructPlanExtP1":
                case "StructPlanExtP2":
                case "StructPlanExtP3":
                case "StructPlanExtP4":
                    $("#nameIDButton").val(this.id);
                    IDButton = this.id;
                    formPopup(this.id);
                    formDel();
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
        const wasAlreadySelected = $(this).hasClass("selected");

        if (!wasAlreadySelected) {
            $("#tab_" + IDButton + " tbody tr").removeClass("selected");
            $(this).addClass("selected");
            chargerValeursDepuisLigne(this, IDButton);
        }
        // sinon : ne rien faire, garder la sélection
    });


    // Fonction de chargement des valeurs depuis la ligne sélectionnée
    function chargerValeursDepuisLigne(row, IDButton) {
        let niveau = row.cells[0].innerHTML;
        let libelle = row.cells[1].innerHTML;
        let abreviation = row.cells[2].innerHTML;
        let format = row.cells[3].innerHTML;

        $("#niveau").val(niveau);
        $("#libelle").val(libelle);
        $("#abreviation").val(abreviation);
        $("#format").val(format);

        let titre = "", abreviationTitre = "", PlanCorrespond = "";
        switch (IDButton) {
            case "StructPlanBudget":
            case "StructActivite":
            case "StructZone":
            case "StructPlan6":
                titre = row.cells[4].innerHTML;
                abreviationTitre = row.cells[5].innerHTML;
                $("#titre").val(titre);
                $("#abreviationTitre").val(abreviationTitre);
                break;
            case "StructPlanExtP1":
            case "StructPlanExtP2":
            case "StructPlanExtP3":
            case "StructPlanExtP4":
                titre = row.cells[4].innerHTML;
                abreviationTitre = row.cells[5].innerHTML;
                PlanCorrespond = row.cells[6].innerHTML;
                $("#titre").val(titre);
                $("#abreviationTitre").val(abreviationTitre);
                $("#PlanCorrespond").val(PlanCorrespond).trigger('change');
                break;
        }

        // Vérifie si c'est la première ligne
        const table = document.getElementById("tab_" + IDButton);
        if (table && table.tBodies[0].rows.length > 0) {
            const firstRow = table.tBodies[0].rows[0];
            window.CheckFirstLine = row === firstRow;
        }
    }
    
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
        case "StructPlan6":
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
                                        <input type="text" name="niveau" value="" id="niveau" class=" input_focus" disabled/>
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
                        <div class="row justify-content-center" style="text-align:center">
                            <div class="col-md-12">
                            <span id="errorCRUD" style="color:red"></span>
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
        case "StructPlan6":
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
                                <option value="0"></option>
                            </select>
                        </div>
                    </div>
                `;
    container.insertAdjacentHTML("beforeend", formHTML);
    requestAnimationFrame(() => {
        chargerDropdownDepuisButtons();
    });
}
function formPopupTab(id) {
    let container = document.getElementById('partieTab');
    container.innerHTML = "";
    let formHTML = `
                    <div class="row">
                        <div class="col-md-12" style="max-height: 200px; overflow-y: auto">
                            <table class="table-bordered tabList" id="tab_${id}" width="100%" tabindex="0">
                                <thead class="sticky-top bg-white">
                                    <tr>
                                        <th data-field="niveau">Niveau</th>
                                        <th data-field="libelle">Libellé</th>
                                        <th data-field="abreviation">Abréviation</th>
                                        <th data-field="format">Format</th>
                                        <th hidden data-field="titre">titre</th>
                                        <th hidden data-field="abreviationTitre">Abre titre</th>
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
                                        <th data-field="niveau">Niveau</th>
                                        <th data-field="libelle">Libellé</th>
                                        <th data-field="abreviation">Abréviation</th>
                                        <th data-field="format">Format</th>
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
                                <th data-field="niveau">Niveau</th>
                                <th data-field="libelle">Libellé</th>
                                <th data-field="abreviation">Abréviation</th>
                                <th data-field="format">Format</th>
                                <th hidden data-field="titre">titre</th>
                                <th hidden data-field="abreviationTitre">Abre titre</th>
                                <th hidden data-field="PlanCorrespond">Plan Corresp</th>
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
function mettreAJourNiveau() {
    const table = document.getElementById("tab_" + IDButton);
    const tbody = table.querySelector("tbody");
    const lignes = tbody ? tbody.rows.length : 0;
    const inputNiveau = document.getElementById("niveau");
    if (lignes === 0) {
        inputNiveau.value = "1";
    } else {
        inputNiveau.value = lignes + 1;
    }
}

function chargerDropdownDepuisButtons() {
    const choixList = document.getElementById("PlanCorrespond");
    if (!choixList) return; // Évite l'erreur si le select n'existe pas

    const buttonValueMap = {
        "StructPlanBudget": "RPOST1",
        "StructPlanCompt": "RCOGE1",
        "StructActivite": "RACTI1",
        "StructZone": "RGEO1",
        "StructPlan6": "RPLAN6"
    };

    choixList.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "0";
    defaultOption.textContent = "--";
    choixList.appendChild(defaultOption);

    Object.keys(buttonValueMap).forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            const style = window.getComputedStyle(button);
            if (style.visibility === "visible") {
                const text = button.textContent.trim();
                if (text) {
                    const option = document.createElement("option");
                    option.value = buttonValueMap[id]; // valeur par défaut associée
                    option.textContent = text;
                    choixList.appendChild(option);
                }
            }
        }
    });
}



//s’adapte automatiquement aux champs présents dans item.
function updateTableWithData(id, listData) {
    const tbody = $("#tab_" + id + " tbody");
    tbody.empty();

    // Récupère les colonnes visibles + leur statut "hidden" à partir du thead
    const columns = [];
    $("#tab_" + id + " thead th").each(function () {
        const colName = $(this).data("field");
        const isHidden = $(this).attr("hidden") !== undefined;
        columns.push({ name: colName || "", hidden: isHidden });
    });

    // Génère les lignes du tableau
    listData.forEach(item => {
        let row = "<tr>";
        columns.forEach(col => {
            const value = col.name ? (item[col.name] ?? "") : "";
            const alignRight = col.name === "format" ? "style='text-align:right'" : "";
            const hiddenAttr = col.hidden ? "hidden" : "";
            row += `<td ${alignRight} ${hiddenAttr}>${value}</td>`;
        });
        row += "</tr>";
        tbody.append(row);
    });
}



function fillFirstRowForm(id, firstRow) {
    const inputs = {};
    const possibleFields = ["niveau", "libelle", "abreviation", "format", "titre", "abreviationTitre", "PlanCorrespond"];

    for (let cellIndex = 0; cellIndex < firstRow.cells.length; cellIndex++) {
        const cell = firstRow.cells[cellIndex];
        const value = cell?.textContent.trim() ?? "";

        const fieldId = possibleFields[cellIndex];
        if (fieldId && $("#" + fieldId).length > 0) {
            if (fieldId === "PlanCorrespond") {
                // Cas spécial pour PlanCorrespond : gérer un Select2
                const $select = $("#" + fieldId);
                if ($select.hasClass('select2-hidden-accessible')) {
                    $select.val(value).trigger('change');
                } else {
                    $select.val(value);
                }
            } else {
                $("#" + fieldId).val(value);
            }
            inputs[fieldId] = value;
        }
    }

    // Gestion du titreStruct
    const titleElement = document.getElementById('titleStruct');
    const titre = inputs.titre ?? "";

    // Vérification si le tableau est vide
    const isTableEmpty = $("#tab_" + id + " tbody tr").length === 0;

    const defaultTitles = {
        StructPlanBudget: "Structure Plan Budgétaire",
        StructActivite: "Structure Plan Analytique",
        StructPlanCompt: "Structure Plan Comptable",
        StructZone: "Zones d'intervention",
        StructPlan6: "Plan 6",
        StructEmplacements: "Structure du Plan des Emplacements",
        StructPlanExtP1: "Plan 1",
        StructPlanExtP2: "Plan 2",
        StructPlanExtP3: "Plan 3",
        StructPlanExtP4: "Plan 4",
    };
    if (titre && !isTableEmpty) {
        titleElement.textContent = titre;
    } else {
        titleElement.textContent = defaultTitles[id] || "";
    }

    $(firstRow).addClass("selected").siblings().removeClass("selected");
}

function GetNameButtonCodif() {
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: "{}",
        url: '/FINPRO_Codifications/GetNameButton',
        success: function (data) {
            document.getElementById('StructPlanBudget').textContent = data.budget;
            document.getElementById('StructPlanCompt').textContent = data.PlanCompte;
            document.getElementById('StructActivite').textContent = data.activite;
            document.getElementById('StructZone').textContent = data.zones;
            document.getElementById('StructPlan6').textContent = data.plan6;
            document.getElementById('StructEmplacements').textContent = data.emplacement;

            document.getElementById('StructPlanExtP1').textContent = data.p1;
            document.getElementById('StructPlanExtP2').textContent = data.p2;
            document.getElementById('StructPlanExtP3').textContent = data.p3;
            document.getElementById('StructPlanExtP4').textContent = data.p4;

            //Vue button
            if (data.statutP6 == true) {
                document.getElementById('StructPlan6').style.visibility = "visible";
            } else {
                document.getElementById('StructPlan6').style.visibility = "hidden";
            }
        }
    });
}
function GedData(id) {
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: { id: id },
        url: '/FINPRO_Codifications/GetListDataStruct',
        success: function (data) {
            //$("#contentTab tbody").empty();
            document.getElementById('Ajouter').textContent = "Ajouter";
            document.getElementById('closeSt').disabled = false;
            document.getElementById('Annuler').disabled = true;

            if (data.listData.length === 0) {
                const defaultTitles = {
                    StructPlanBudget: "Structure Plan Budgétaire",
                    StructActivite: "Structure Plan Analytique",
                    StructPlanCompt: "Structure Plan Comptable",
                    StructZone: "Zones d'intervention",
                    StructPlan6: "Plan 6",
                    StructEmplacements: "Structure du Plan des Emplacements",
                    StructPlanExtP1: "Plan 1",
                    StructPlanExtP2: "Plan 2",
                    StructPlanExtP3: "Plan 3",
                    StructPlanExtP4: "Plan 4",
                };
                // Gestion du titreStruct
                const titleElement = document.getElementById('titleStruct');
                titleElement.textContent = defaultTitles[id]

                document.getElementById('Ajouter').disabled = false;
                document.getElementById('Imprimer').disabled = true;
                document.getElementById('Modifier').disabled = true;
                document.getElementById('Supprimer').disabled = true;
                resetForm();
            } else {
                document.getElementById('Ajouter').disabled = false;
                totalPost = parseInt(data.total);
                updateTableWithData(id, data.listData);

                const table = document.getElementById("tab_" + id);
                if (table && table.tBodies[0].rows.length > 0) {
                    CheckFirstLine = true;
                    fillFirstRowForm(id, table.tBodies[0].rows[0]);
                }

                compterCaracteresColums(id);
                document.getElementById('Imprimer').disabled = false;
                document.getElementById('Modifier').disabled = false;
                document.getElementById('Supprimer').disabled = false;
            }

            $(".disabled_me").prop("disabled", true);
        }
    });
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
    totalPost = 0;
}
function toggleForms(showId) {
    // Liste des IDs des formulaires
    let forms = ["partieStructurePlan", "partieDelete"];
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