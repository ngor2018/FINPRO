var pageName = $("#pageName").val();
var IDButton = null; //clique button parent
var IDbuttonCorresp = null;  //valeur par default
var isEditing = false  // Désactiver si en mode édition ou Ajout
var etatCRUD = false;//Defini statut Ajout
var nameButton = null;
var numEnregCores = null;
$(function () {
    parameter();
})
var Ajouter = function () {
    nameButton = "Ajout";
    isEditing = true;
    bloquerZoneTable();
    const btnAjouter = document.getElementById('Ajouter');
    if (btnAjouter.textContent === "Ajouter") {
        initialiserFormulaire();
        return;
    }
    // En mode "Enregistrer"
    if (!validerChamps()) return;

    const table = document.getElementById("tab_" + IDButton);
    const objData = collecterDonneesFormulaire();
    $.ajax({
        url: "/FINPRO_Codifications/CRUDPlanCompta",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(objData),
        success: function (data) {
            if (etatCRUD === true) {  //Edition
                if (data.statut === true) {
                    miseAJourLigneTable(table, objData);
                    afficherMessage(data.message);
                    Annuler();
                } else {
                    //afficherErreurPlanCorrespond(data.message);
                }
            } else { //Ajout
                if (data.statut === true) {
                    afficherMessage(data.message);
                    var niveau1 = $("#Choixniveau").val();
                    var niveau2 = $("#next_niveau").val();
                    GetDataniveau2(niveau1, niveau2);
                    setTimeout(() => Annuler(), 1000);
                } else {
                    handleAddError(data.message);
                }
            }
        },
        error: function () {
            alert("Erreur lors de l'envoi des données.");
        }
    });
}
var Modifier = function () {
    nameButton = "Modification";
    isEditing = true;
    etatCRUD = true;  //Defini statut modifier
    bloquerZoneTable();
    initialiserFormulaireEdit();

}
var Annuler = function () {
    nameButton = null;
    isEditing = false;
    debloquerZoneTable();
    $('.input_focus').siblings('span.erreur').hide();
    const table = document.getElementById("tab_" + IDButton);
    const rows = table.tBodies[0].rows;
    $(".disabled_me").prop("disabled", true);


    document.getElementById('Ajouter').textContent = "Ajouter";
    document.getElementById('closeSt').disabled = false;
    document.getElementById('Annuler').disabled = true;

    if (table.tBodies[0].rows.length == 0) {
        disableButtons();
        reset();
    } else {
        $("#Modifier, #Supprimer, #Imprimer, #Voir").prop("disabled", false);
        // Si des lignes existent, on récupère celle sélectionnée
        const selectedRow = Array.from(rows).find(row => row.classList.contains('selected'));
        var code = null, libelle = null, etatActif = null;
        switch (IDButton) {
            case "StructPlanBudget":
            case "StructActivite":
            case "StructZone":
            case "StructEmplacements":
            case "StructPlan6":
            case "StructPlanExtP1":
            case "StructPlanExtP2":
            case "StructPlanExtP3":
            case "StructPlanExtP4":
                document.getElementById('Choixniveau').disabled = false;
                document.getElementById('aide_format').textContent = "";
                if (selectedRow) {
                    code = selectedRow.cells[0].innerHTML.trim();
                    libelle = selectedRow.cells[1].innerHTML.trim();
                    etatActif = selectedRow.cells[3].innerHTML.trim();

                    $("#code").val(code);
                    $("#libelle").val(libelle);

                    // Si la div contient des balises (au moins un enfant)
                    if ($('#divLastniveau').children().length > 0) {
                        const $checkbox = $("#checkActif");
                        $checkbox.prop("checked", etatActif === "1" || etatActif.toLowerCase() === "true");
                    }
                }
                break;

            case "StructPlanCompt":
                document.getElementById('Choixniveau').disabled = false;
                document.getElementById('aide_format').textContent = "";
                if (selectedRow) {
                    code = selectedRow.cells[0].innerHTML.trim();
                    libelle = selectedRow.cells[1].innerHTML.trim();
                    var superClass = null;
                    const btnText = document.getElementById("StructPlan6");
                    if (btnText) {
                        const text = btnText.textContent.trim();

                        if (text) {
                            if (isElementVisible(btnText)) {
                                superClass = selectedRow.cells[11].innerHTML.trim();
                                $(".disabledBtnPl").prop("disabled", true);
                                //console.log("✅ Le bouton #plan6 contient du texte visible :", text);
                            } else {
                                superClass = selectedRow.cells[10].innerHTML.trim();
                                //console.log("⚠️ Le bouton #plan6 contient du texte mais il n'est pas visible.");
                            }
                        } else {
                            superClass = selectedRow.cells[10].innerHTML.trim();
                            //console.log("❌ Le bouton #plan6 ne contient pas de texte.");
                        }
                    } else {
                        superClass = selectedRow.cells[10].innerHTML.trim();
                        //console.log("❌ Le bouton #plan6 n'existe pas dans le DOM.");
                    }

                    $("#code").val(code);
                    $("#libelle").val(libelle);

                    if ($('#superClass').length > 0) {
                        $('#superClass').val(superClass).trigger('change');
                    }

                    if ($("#formLast").children().length > 0) {
                        $(".disabledBtnPl").prop("disabled", true);
                        const checkCollectif = selectedRow.cells[3].querySelector("input[type='checkbox']");
                        const checkSuivi = selectedRow.cells[4].querySelector("input[type='checkbox']");
                        const checkActif = selectedRow.cells[9].querySelector("input[type='checkbox']");
                        var checkPlan6 = null, checkImputation = null;

                        if (checkCollectif && checkCollectif.checked) {
                            $("#checkCpteCollectif").prop("checked", true);
                        } else {
                            $("#checkCpteCollectif").prop("checked", false);
                        }
                        if (checkSuivi && checkSuivi.checked) {
                            $("#checkCpteSuivi").prop("checked", true);
                        } else {
                            $("#checkCpteSuivi").prop("checked", false);
                        }
                        if (checkActif && checkActif.checked) {
                            $("#checkActif").prop("checked", true);
                        } else {
                            $("#checkActif").prop("checked", false);
                        }
                        const btn_Text = document.getElementById("StructPlan6");
                        if (btn_Text) {
                            const text_ = btn_Text.textContent.trim();
                            if (text_) {
                                if (isElementVisible(btnText)) {
                                    checkPlan6 = selectedRow.cells[9].querySelector("input[type='checkbox']");
                                    checkImputation = selectedRow.cells[12].querySelector("input[type='checkbox']");

                                    if (checkPlan6 && checkPlan6.checked) {
                                        $("#checkPlan6").prop("checked", true);
                                    } else {
                                        $("#checkPlan6").prop("checked", false);
                                    }
                                    if (checkImputation && checkImputation.checked) {
                                        $("#checkImputation").prop("checked", true);
                                    } else {
                                        $("#checkImputation").prop("checked", false);
                                    }
                                    //console.log("✅ Le bouton #plan6 contient du texte visible :", text);
                                } else {
                                    checkImputation = selectedRow.cells[11].querySelector("input[type='checkbox']");
                                    if (checkImputation && checkImputation.checked) {
                                        $("#checkImputation").prop("checked", true);
                                    } else {
                                        $("#checkImputation").prop("checked", false);
                                    }
                                    //console.log("⚠️ Le bouton #plan6 contient du texte mais il n'est pas visible.");
                                }
                            } else {
                                checkImputation = selectedRow.cells[11].querySelector("input[type='checkbox']");
                                if (checkImputation && checkImputation.checked) {
                                    $("#checkImputation").prop("checked", true);
                                } else {
                                    $("#checkImputation").prop("checked", false);
                                }
                                //console.log("❌ Le bouton #plan6 ne contient pas de texte.");
                            }
                        } else {
                            checkImputation = selectedRow.cells[11].querySelector("input[type='checkbox']");
                            if (checkImputation && checkImputation.checked) {
                                $("#checkImputation").prop("checked", true);
                            } else {
                                $("#checkImputation").prop("checked", false);
                            }
                            //console.log("❌ Le bouton #plan6 n'existe pas dans le DOM.");
                        }
                        const checkBudget = selectedRow.cells[5].querySelector("input[type='checkbox']");
                        const checkAnalyt = selectedRow.cells[6].querySelector("input[type='checkbox']");
                        const checkGeo = selectedRow.cells[7].querySelector("input[type='checkbox']");
                        const checkFinance = selectedRow.cells[8].querySelector("input[type='checkbox']");

                        if (checkBudget && checkBudget.checked) {
                            $("#checkBudget").prop("checked", true);
                        } else {
                            $("#checkBudget").prop("checked", false);
                        }
                        if (checkAnalyt && checkAnalyt.checked) {
                            $("#checkAnalyt").prop("checked", true);
                        } else {
                            $("#checkAnalyt").prop("checked", false);
                        }
                        if (checkGeo && checkGeo.checked) {
                            $("#checkGeo").prop("checked", true);
                        } else {
                            $("#checkGeo").prop("checked", false);
                        }
                        if (checkFinance && checkFinance.checked) {
                            $("#checkFinanc").prop("checked", true);
                        } else {
                            $("#checkFinanc").prop("checked", false);
                        }
                        updateToggleButtonText();
                    }
                }
                break;
            case "StructCorrespondPlan":
                if (selectedRow) {
                    numEnregCores = selectedRow.cells[1].innerHTML.trim();
                    code = selectedRow.cells[1].innerHTML.trim();
                    correspond = selectedRow.cells[2].innerHTML.trim();
                    $("#code").val(code).trigger('change');
                    $("#correspondance").val(correspond).trigger('change');
                }
                break;
            case "StructSousCategorie":
                document.getElementById('codeConvention').disabled = false;
                document.getElementById('codeCategorie').disabled = false;
                if (selectedRow) {
                    $("#codeSousCat").val(selectedRow.cells[2].innerHTML.trim());
                    $("#libelle").val(selectedRow.cells[3].innerHTML.trim());
                    if (selectedRow.cells[4].innerHTML.trim() == "True") {
                        document.getElementById('checkActif').checked = true;
                    } else {
                        document.getElementById('checkActif').checked = false;
                    }
                }
                break;
        }
        switch (IDButton) {
            case "StructPlanBudget":
            case "StructActivite":
            case "StructZone":
            case "StructEmplacements":
            case "StructPlan6":
            case "StructPlanCompt":
                $("#TXT, #excel, #Importation").prop("disabled", false);
                break;
        }
    }
    //DataNiveau();
    switch (IDButton) {
        case "StructPlanBudget":
        case "StructActivite":
        case "StructZone":
        case "StructEmplacements":
        case "StructPlan6":
        case "StructPlanExtP1":
        case "StructPlanExtP2":
        case "StructPlanExtP3":
        case "StructPlanExtP4":
        case "StructPlanCompt":
            document.getElementById('Choixniveau').disabled = false;
            document.getElementById('aide_format').textContent = "";
            if ($('#divTo_niveau').children().length > 0) {
                document.getElementById('next_niveau').disabled = false;
            }
            break;
    }
}
function disableButtons() {
    $("#Modifier, #Supprimer, #Imprimer, #Voir").prop("disabled", true);

    if (["StructPlanBudget", "StructActivite", "StructZone",
        "StructEmplacements", "StructPlan6", "StructPlanCompt"].includes(IDButton)) {
        $("#TXT, #excel, #Importation").prop("disabled", true);
    }
}
function handleAddError(message) {
    const structureTypes = [
        "StructPlanBudget", "StructActivite", "StructZone",
        "StructEmplacements", "StructPlan6", "StructPlanExtP1",
        "StructPlanExtP2", "StructPlanExtP3", "StructPlanExtP4"
    ];

    if (structureTypes.includes(IDButton)) {
        $("#code").siblings('span.erreur').html(message).css('display', 'block');
    }
}
function reset() {
    switch (IDButton) {
        case "StructPlanBudget":
        case "StructActivite":
        case "StructZone":
        case "StructEmplacements":
        case "StructPlan6":
        case "StructPlanExtP1":
        case "StructPlanExtP2":
        case "StructPlanExtP3":
        case "StructPlanExtP4":
            if ($('#divLastniveau').children().length > 0) {
                document.getElementById('checkActif').checked = false;
            }
            $("#code").val('');
            $("#libelle").val('');
            break;
        case "StructPlanCompt":
            $("#code").val('');
            $("#libelle").val('');
            if ($('#divLastniveau').children().length > 0) {
                //document.getElementById('checkActif').checked = false;
            }
            break;
        case "StructCorrespondPlan":
            $("#code").val(0).trigger('change');
            $("#correspondance").val(0).trigger('change');
            break;
        case "StructSousCategorie":
            document.getElementById('checkActif').checked = false;
            document.getElementById('codeConvention').disabled = false;
            document.getElementById('codeCategorie').disabled = false;
            $("#codeSousCat").val('');
            $("#libelle").val('');
            break;
    }
    $('.input_focus').siblings('span.erreur').css('display', 'none');
}
function bloquerZoneTable() {
    const $wrapper = $('#tab_' + IDButton + '_wrapper');

    // Supprimer l'overlay s'il existe déjà
    $wrapper.find('.datatable-overlay').remove();
    var overlay = "";
    switch (nameButton) {
        case "Ajout":
            overlay = `
                        <div class="datatable-overlay" style="
                            position: absolute;
                            top: 0; left: 0;
                            width: 100%; height: 100%;
                            background: rgba(255, 255, 255, 0.7);
                            z-index: 10;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            pointer-events: all;
                        ">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Chargement...</span>
                            </div>
                            <span style="margin-left: 10px;">Veuillez terminer l'ajout...</span>
                        </div>
                    `;
            break;
        default:
            overlay = `
                        <div class="datatable-overlay" style="
                            position: absolute;
                            top: 0; left: 0;
                            width: 100%; height: 100%;
                            background: rgba(255, 255, 255, 0.7);
                            z-index: 10;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            pointer-events: all;
                        ">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Chargement...</span>
                            </div>
                            <span style="margin-left: 10px;">Veuillez terminer l'édition...</span>
                        </div>
                    `;
            break;
    }
    // Positionnement relatif requis pour parent
    $wrapper.css('position', 'relative');
    $wrapper.append(overlay);
}
function debloquerZoneTable() {
    const $wrapper = $('#tab_' + IDButton + '_wrapper');
    $wrapper.find('.datatable-overlay').remove(); // Supprimer l'overlay
    $wrapper.css('position', ''); // Réinitialiser si besoin
}

function initialiserFormulaire() {
    $(".disabled_me").prop("disabled", false);
    reset();
    switch (IDButton) {
        case "StructPlanBudget":
        case "StructActivite":
        case "StructZone":
        case "StructEmplacements":
        case "StructPlan6":
        case "StructPlanExtP1":
        case "StructPlanExtP2":
        case "StructPlanExtP3":
        case "StructPlanExtP4":
        case "StructPlanCompt":
            CodeNiveau();
            break;
    }
    document.getElementById('Ajouter').textContent = "Enregistrer";
    $("#Modifier, #Supprimer, #closeSt").prop("disabled", true);
    document.getElementById('Annuler').disabled = false;
    switch (IDButton) {
        case "StructPlanBudget":
        case "StructActivite":
        case "StructZone":
        case "StructEmplacements":
        case "StructPlan6":
        case "StructPlanCompt":
            $("#Imprimer,#Voir, #TXT, #excel, #Importation").prop("disabled", true);
            break;
        case "StructBailleurFond":
        case "StructConventions":
            $("#Imprimer,#Voir, #Fiche").prop("disabled", true);
            break;
        case "StructPlanExtP1":
        case "StructPlanExtP2":
        case "StructPlanExtP3":
        case "StructPlanExtP4":
        case "StructCorrespondPlan":
        case "StructPlanJournaux":
        case "StructCategorieFinance":
            $("#Imprimer,#Voir").prop("disabled", true);
            break;
        case "StructPlanTier":
            $("#Imprimer,#Voir,#Duplication,#Recherche,#Importation").prop("disabled", true);
            break;
        case "StructSousCategorie":
            $("#Imprimer,#Voir,#codeConvention,#codeCategorie").prop("disabled", true);
            setTimeout(function () {
                $("#codeSousCat").focus();
            }, 500)
            break;
        case "StructVentilation":
        case "StructSignataires":
            $("#Liste").prop("disabled", true);
            break;
    }
    switch (IDButton) {
        case "StructPlanCompt":
            const btnText = document.getElementById("StructPlan6");
            if (btnText) {
                const text = btnText.textContent.trim();
                if (text) {
                    if (isElementVisible(btnText)) {
                        $(".disabledBtnPl").prop("disabled", false);
                        //console.log("✅ Le bouton #plan6 contient du texte visible :", text);
                    } 
                } 
            }
            break;
    }
}
function initialiserFormulaireEdit() {
    document.getElementById('Ajouter').textContent = "Enregistrer";
    $("#Modifier, #Supprimer, #closeSt").prop("disabled", true);
    document.getElementById('Annuler').disabled = false;
    switch (IDButton) {
        case "StructPlanBudget":
        case "StructActivite":
        case "StructZone":
        case "StructEmplacements":
        case "StructPlan6":
        case "StructPlanExtP1":
        case "StructPlanExtP2":
        case "StructPlanExtP3":
        case "StructPlanExtP4":
            document.getElementById('libelle').disabled = false;
            if ($('#checkActif').length > 0) {
                document.getElementById('checkActif').disabled = false;
            }
            break;
        case "StructPlanCompt":
            document.getElementById('libelle').disabled = false;
            if ($('#divLastniveau').length > 0 && $('#superClass').length > 0) {
                document.getElementById('superClass').disabled = false;
            }
            const btnText = document.getElementById("StructPlan6");
            if (btnText) {
                const text = btnText.textContent.trim();
                if (text) {
                    if (isElementVisible(btnText)) {
                        $(".disabledBtnPl").prop("disabled", true);
                        //console.log("✅ Le bouton #plan6 contient du texte visible :", text);
                    }
                }
            }
            break;
    }

    switch (IDButton) {
        case "StructPlanBudget":
        case "StructActivite":
        case "StructZone":
        case "StructEmplacements":
        case "StructPlan6":
            $("#Imprimer,#Voir, #TXT, #excel, #Importation").prop("disabled", true);
            break;
        case "StructPlanCompt":
            $("#Imprimer,#Voir, #TXT, #excel, #Importation").prop("disabled", true);
            break;
        case "StructBailleurFond":
        case "StructConventions":
            $("#Imprimer,#Voir, #Fiche").prop("disabled", true);
            break;
        case "StructPlanExtP1":
        case "StructPlanExtP2":
        case "StructPlanExtP3":
        case "StructPlanExtP4":
        case "StructCorrespondPlan":
        case "StructPlanJournaux":
        case "StructCategorieFinance":
            $("#Imprimer,#Voir").prop("disabled", true);
            break;
        case "StructPlanTier":
            $("#Imprimer,#Voir,#Duplication,#Recherche,#Importation").prop("disabled", true);
            break;
        case "StructSousCategorie":
            $("#Imprimer,#Voir,#codeConvention,#codeCategorie").prop("disabled", true);
            break;
        case "StructVentilation":
        case "StructSignataires":
            $("#Liste").prop("disabled", true);
            break;
    }
}
function validerChamps() {
    let isValid = true;
    const champs = [
        { id: "#code", nom: "code" },
        { id: "#libelle", nom: "libelle" }
    ];

    champs.forEach(c => {
        const $champ = $(".form_padd").find(c.id);
        if ($champ.length === 0) return; // Champ non présent dans la vue

        const val = $champ.val().trim();
        if (!val) {
            isValid = false;
            $champ.siblings("span.erreur").html("champ obligatoire").show();
        } else {
            $champ.siblings("span.erreur").hide();

            // Vérification du maxlength pour #code dans certains cas
            if (c.id === "#code") {
                switch (IDButton) {
                    case "StructPlanBudget":
                    case "StructActivite":
                    case "StructZone":
                    case "StructEmplacements":
                    case "StructPlan6":
                    case "StructPlanExtP1":
                    case "StructPlanExtP2":
                    case "StructPlanExtP3":
                    case "StructPlanExtP4":
                    case "StructPlanCompt":
                        const maxLength = parseInt($champ.attr("maxlength") || 0, 10);
                        if (val.length < maxLength) {
                            isValid = false;
                            $champ.siblings("span.erreur").html("remplir taille maximale").show();
                        }
                        break;
                }
            }
        }
    });

    return isValid;
}
function collecterDonneesFormulaire() {
    const $form = $(".form_padd");

    const getValueIfExists = (selector) => {
        const $el = $form.find(selector);
        return $el.length ? $el.val() : null;
    };
    // Fonction pour les checkboxes qui vérifie d'abord si l'élément est visible
    // puis retourne l'état coché si visible, true par défaut si non visible ou inexistant
    const getCheckboxStateIfExists = (selector) => {
        const $el = $form.find(selector);

        // Si l'élément n'existe pas, retourner true par défaut
        if (!$el.length) {
            return true;
        }

        // Vérifier si l'élément est visible
        // jQuery :visible vérifie si l'élément a une hauteur/largeur > 0 et est affiché
        const isVisible = $el.is(":visible");
        // Si l'élément n'est pas visible, retourner true par défaut
        if (!isVisible) {
            return true;
        }
        // Sinon retourner l'état coché de la checkbox
        return $el.prop('checked');
    };

    return {
        statut: etatCRUD,
        instance: IDButton,
        niveau: getValueIfExists("#Choixniveau"),
        niveauVal: getValueIfExists("#next_niveau"),
        code: getValueIfExists("#code"),
        libelle: getValueIfExists("#libelle"),
        cocherActif: getCheckboxStateIfExists("#checkActif"), // Retourne true si checkbox non visible ou inexistante
    };
}


const commonColumnMappings = {
    standard: { code: 0, libelle: 1, checkActif: 3 },
    zone: { code: 0, libelle: 1 },
    custom: { code: 0, nom: 2, actif: 4 }
};
const tableColumnMapping = {
    StructPlanBudget: commonColumnMappings.standard,
    StructActivite: commonColumnMappings.standard,
    StructZone: commonColumnMappings.standard,
    StructEmplacements: commonColumnMappings.standard,
    StructPlan6: commonColumnMappings.standard,
    StructPlanExtP1: commonColumnMappings.standard,
    StructPlanExtP2: commonColumnMappings.standard,
    StructPlanExtP3: commonColumnMappings.standard,
    StructPlanExtP4: commonColumnMappings.standard,
};
function miseAJourLigneTable(table, data) {
    const mapping = tableColumnMapping[IDButton];
    if (!mapping || typeof mapping.code === 'undefined') return;

    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        const codeCell = row.cells[mapping.code];

        if (codeCell && codeCell.innerHTML == data.code) {
            for (const [key, index] of Object.entries(mapping)) {
                if (key === "code") continue; // Ne pas modifier la clé primaire

                const cell = row.cells[index];
                if (!cell) continue;

                if (typeof data[key] !== 'undefined') {
                    // Traitement particulier pour les booléens (checkbox)
                    if (typeof data[key] === 'boolean') {
                        cell.innerHTML = data[key] ? 1 : 0;
                    } else {
                        cell.innerHTML = data[key];
                    }
                }
            }

            break; // Ligne trouvée et mise à jour
        }
    }
}

function afficherMessage(message) {
    $('.alert_Param').removeClass("hide").addClass("show showAlert");
    $(".result_Param").html(`<font style="color: #ce8500;">${message}</font>`);
    setTimeout(() => {
        $('.alert_Param').addClass("hide").removeClass("show");
    }, 1000);
}
function parameter() {
    GetNameButtonCodif();
    var pageNameTitreController = $("#pageNameTitreController").val();
    var pageNameController = $("#pageNameController").val();
    var pageNameProjet = $("#pageNameProjet").val();
    var FormHTM = "";
    var titre = $("#nameTitre");
    switch (pageName) {
        case "PlanCompte":
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

    document.querySelectorAll(".PlCompte").forEach(button => {
        button.addEventListener("click", function () {
            var button = this.id;
            $("#nameIDButton").val(button);
            IDButton = button;
            formPopup();
            switch (IDButton) {
                case "StructCorrespondPlan":
                    var button1 = document.getElementById('StructPlanExtP1'), button2 = document.getElementById('StructPlanExtP2'),
                        button3 = document.getElementById('StructPlanExtP3'), button4 = document.getElementById('StructPlanExtP4');
                    document.getElementById('P1Activite-tab').textContent = button1.textContent + " (Activité)";
                    document.getElementById('P2Zones-tab').textContent = button2.textContent + " (Zones)";
                    document.getElementById('P3Budget-tab').textContent = button3.textContent + " (Budget)";
                    document.getElementById('P4Compte-tab').textContent = button4.textContent + " (Compte)";
                    document.getElementById('P1Activite-tab').click();
                    //GetDataCorrespondance();
                    break;
            }
            //formDel();
        });
    });

}
function formPopup() {
    let container = document.getElementById('partieStructurePlan');
    container.innerHTML = "";
    toggleForms("partieStructurePlan");
    let formHTML = "";
    switch (IDButton) {
        case "StructPlanBudget":
        case "StructActivite":
        case "StructZone":
        case "StructEmplacements":
        case "StructPlan6":
        case "StructPlanExtP1":
        case "StructPlanExtP2":
        case "StructPlanExtP3":
        case "StructPlanExtP4":
        case "StructPlanCompt":
            formHTML = `
                        <div class="row justify-content-center" style="padding-top:2%">
                            <div class="col-md-11 pageView">
                                <div class="row">
                                    <div class="col-md-12" style="padding-bottom: 10px;border-bottom:1px solid #bdb8b8">
                                        <div class="container-fluid_top">
                                            <div class="header-row_top">
                                                <div class="title-container_top">
                                                    <strong id="titleStruct">BECK</strong>
                                                </div>
                                                <div id="buttonUser">

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form_padd">
                                            <div class="row justify-content-center" style="text-align:center">
                                                <div class="col-md-12">
                                                    <div class="alert_Param hide">
                                                        <span class="fas fa-exclamation-circle"></span>
                                                        <span class="result_Param"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-3">
                                                    <label for="Choixniveau">Choix du niveau</label>
                                                </div>
                                                <div class="col-md-9">
                                                    <select class="input_focus choixSelect" style="width:100%" id="Choixniveau">
                                                    </select>
                                                    <span class="erreur"></span>
                                                </div>
                                            </div>
                                            <div id="divTo_niveau" style="display:none">
                                                <div class="row">
                                                    <div class="col-md-3">
                                                        <label for="next_niveau" id="label_next_niveau"></label>
                                                    </div>
                                                    <div class="col-md-9">
                                                        <select id="next_niveau" class="choixSelect input_focus" style="width:100%">
                                                        </select>
                                                        <span class="erreur"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-3">
                                                    <label for="code">Code</label>
                                                </div>
                                                <div class="col-md-6">
                                                    <input type="text" name="code" value="" id="code" class="input_focus disabled_me" />
                                                    <small id="aide_format" class="form-text text-muted"></small>
                                                    <span class="erreur"></span>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-3">
                                                    <label for="libelle">Libellé</label>
                                                </div>
                                                <div class="col-md-9">
                                                    <input type="text" name="libelle" value="" id="libelle" class="input_focus disabled_me" />
                                                    <span class="erreur"></span>
                                                </div>
                                            </div>
                                            <div id="divLastniveau">

                                            </div>
                                        </div>

                                        <div id="partieTab" style="padding-top:10px">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
            break;
        case "StructCorrespondPlan":
            formHTML = `
                        <div class="row justify-content-center" style="padding-top:2%">
                            <div class="col-md-11 pageView">
                                <div class="row">
                                    <div class="col-md-12" style="padding-bottom: 10px;border-bottom:1px solid #bdb8b8">
                                        <div class="container-fluid_top">
                                            <div class="header-row_top">
                                                <div class="title-container_top">
                                                    <strong id="titleStruct">BECK</strong>
                                                </div>
                                                <div id="buttonUser">

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="form_padd">
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="row justify-content-center" style="text-align:center">
                                                <div class="col-md-12">
                                                    <div class="alert_Param hide">
                                                        <span class="fas fa-exclamation-circle"></span>
                                                        <span class="result_Param"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <ul class="nav nav-underline fs-9" id="myTab" role="tablist">
                                                        <li class="nav-item" role="presentation"><a class="nav-link active PlCorrespond" id="P1Activite-tab" data-bs-toggle="tab" href="#" role="tab" aria-controls="tab-P1Activite" aria-selected="true"></a></li>
                                                        <li class="nav-item" role="presentation"><a class="nav-link PlCorrespond" id="P2Zones-tab" data-bs-toggle="tab" href="#" role="tab" aria-controls="tab-P2Zones" aria-selected="false" tabindex="-1"></a></li>
                                                        <li class="nav-item" role="presentation"><a class="nav-link PlCorrespond" id="P3Budget-tab" data-bs-toggle="tab" href="#" role="tab" aria-controls="tab-P3Budget" aria-selected="false" tabindex="-1"></a></li>
                                                        <li class="nav-item" role="presentation"><a class="nav-link PlCorrespond" id="P4Compte-tab" data-bs-toggle="tab" href="#" role="tab" aria-controls="tab-P4Compte" aria-selected="false" tabindex="-1"></a></li>
                                                    </ul>
                                                    <div class="row">
                                                        <div class="col-md-4">
                                                            <label for="code">Code</label>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <select id="code" class="input_focus choixSelect disabled_me" style="width:100%">
                                                            </select>
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-4">
                                                            <label for="correspondance">Correspond à</label>
                                                        </div>
                                                        <div class="col-md-8">
                                                            <select id="correspondance" class="input_focus choixSelect disabled_me" style="width:100%">
                                                            </select>
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                    <div id="partieTab">

                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
            break;
        case "StructPlanTier":
            formHTML = `
                        <div class="row justify-content-center" style="padding-top:2%">
                            <div class="col-md-11 pageView">
                                <div class="row">
                                    <div class="col-md-12" style="padding-bottom: 10px;border-bottom:1px solid #bdb8b8">
                                        <div class="container-fluid_top">
                                            <div class="header-row_top">
                                                <div class="title-container_top">
                                                    <strong id="titleStruct">BECK</strong>
                                                </div>
                                                <div id="buttonUser">

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form_padd">
                                            <div class="row justify-content-center" style="text-align:center">
                                                <div class="col-md-12">
                                                    <div class="alert_Param hide">
                                                        <span class="fas fa-exclamation-circle"></span>
                                                        <span class="result_Param"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <h5 style="color:#ff6a00">Saisie</h5>
                                                </div>
                                            </div>
                                            <div class="row justify-content-center" style="text-align:center">
                                                <div class="col-md-11" style="border:1px solid #e0d8d8;border-radius:5px;padding:10px">
                                                    <div class="row">
                                                        <div class="col-md-3">
                                                            <label for="afficheCpeGen">Afficher par Compte Général</label>
                                                        </div>
                                                        <div class="col-md-9">
                                                            <select id="afficheCpeGen" class="input_focus choixSelect" style="width:100%">
                                                            </select>
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-3">
                                                            <label for="compteGene">Compte Général</label>
                                                        </div>
                                                        <div class="col-md-9">
                                                            <select id="compteGene" class="input_focus choixSelect" style="width:100%">
                                                            </select>
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-3">
                                                            <label for="compteAuxi">Compte auxiliaire</label>
                                                        </div>
                                                        <div class="col-md-7">
                                                            <select id="compteAuxi" class="input_focus choixSelect" style="width:100%">
                                                            </select>
                                                            <span class="erreur"></span>
                                                        </div>
                                                        <div class="col-md-2">
                                                            <div class="form-check">
                                                                <label class="form-check-label" for="checkActif" style="cursor:pointer">Actif</label>
                                                                <input class="form-check-input" type="checkbox" value="" id="checkActif" style="cursor:pointer">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row" style="padding-top:10px">
                                                <div class="col-md-12">
                                                    <ul class="nav nav-underline fs-9" id="myTab" role="tablist">
                                                        <li class="nav-item" role="presentation"><a class="nav-link active" id="ficheSign-tab" data-bs-toggle="tab" href="#tab-ficheSign" role="tab" aria-controls="tab-ficheSign" aria-selected="true">Fiche Signalétique</a></li>
                                                        <li class="nav-item" role="presentation"><a class="nav-link" id="ListeTiers-tab" data-bs-toggle="tab" href="#tab-ListeTiers" role="tab" aria-controls="tab-ListeTiers" aria-selected="false" tabindex="-1">Liste des Tiers</a></li>
                                                    </ul>
                                                    <div class="tab-content mt-3" id="myTab2Content">
                                                        <div class="tab-pane fade active show" id="tab-ficheSign" role="tabpanel" aria-labelledby="ficheSign-tab">
                                                            <div class="row">
                                                                <div class="col-md-12">
                                                                    <div class="row">
                                                                        <div class="col-md-12">
                                                                            <h6 style="color:#ff6a00"><u>Identification</u></h6>
                                                                        </div>
                                                                    </div>
                                                                    <div class="row">
                                                                        <div class="col-md-3">
                                                                            <label for="nomRaisonSociale">Nom ou Raison Sociale</label>
                                                                        </div>
                                                                        <div class="col-md-9">
                                                                            <input type="text" name="nomRaisonSociale" value="" id="nomRaisonSociale" class="input_focus" />
                                                                            <span class="erreur"></span>
                                                                        </div>
                                                                    </div>
                                                                    <div class="row">
                                                                        <div class="col-md-3">
                                                                            <label for="nomContact">Nom Contact</label>
                                                                        </div>
                                                                        <div class="col-md-9">
                                                                            <input type="text" name="nomContact" value="" id="nomContact" class="input_focus" />
                                                                            <span class="erreur"></span>
                                                                        </div>
                                                                    </div>
                                                                    <div class="row mb-2">
                                                                        <div class="col-md-12">
                                                                            <h6 style="color:#ff6a00"><u>Adresse</u></h6>
                                                                        </div>
                                                                    </div>
                                                                    <div class="row">
                                                                        <div class="col-md-3">
                                                                            <label for="Ligne_1_Adresse">1ère ligne d'adresse</label>
                                                                        </div>
                                                                        <div class="col-md-9">
                                                                            <input type="text" name="Ligne_1_Adresse" value="" id="Ligne_1_Adresse" class="input_focus" />
                                                                            <span class="erreur"></span>
                                                                        </div>
                                                                    </div>
                                                                    <div class="row">
                                                                        <div class="col-md-3">
                                                                            <label for="Ligne_2_Adresse">2ème ligne d'adresse</label>
                                                                        </div>
                                                                        <div class="col-md-9">
                                                                            <input type="text" name="Ligne_2_Adresse" value="" id="Ligne_2_Adresse" class="input_focus" />
                                                                            <span class="erreur"></span>
                                                                        </div>
                                                                    </div>
                                                                    <div class="row">
                                                                        <div class="col-md-3">
                                                                            <label for="ville">Ville</label>
                                                                        </div>
                                                                        <div class="col-md-3">
                                                                            <input type="text" name="ville" value="" id="ville" class="input_focus" />
                                                                            <span class="erreur"></span>
                                                                        </div>
                                                                        <div class="col-md-2">
                                                                            <label for="pays">Pays</label>
                                                                        </div>
                                                                        <div class="col-md-4">
                                                                            <select id="pays" class="input_focus choixSelect" style="width:100%">
                                                                            </select>
                                                                            <span class="erreur"></span>
                                                                        </div>
                                                                    </div>
                                                                    <div class="row">
                                                                        <div class="col-md-3">
                                                                            <label for="telephone">Téléphone</label>
                                                                        </div>
                                                                        <div class="col-md-3">
                                                                            <input type="text" name="telephone" value="" id="telephone" class="input_focus" />
                                                                            <span class="erreur"></span>
                                                                        </div>
                                                                        <div class="col-md-2">
                                                                            <label for="fax">Fax</label>
                                                                        </div>
                                                                        <div class="col-md-4">
                                                                            <input type="text" name="fax" value="" id="fax" class="input_focus" />
                                                                            <span class="erreur"></span>
                                                                        </div>
                                                                    </div>
                                                                    <div class="row">
                                                                        <div class="col-md-3">
                                                                            <label for="email">Email</label>
                                                                        </div>
                                                                        <div class="col-md-9">
                                                                            <input type="text" name="email" value="" id="email" class="input_focus" />
                                                                            <span class="erreur"></span>
                                                                        </div>
                                                                    </div>
                                                                    <div class="row mb-2">
                                                                        <div class="col-md-12">
                                                                            <h6 style="color:#ff6a00"><u>Coordonnées Bancaires</u></h6>
                                                                        </div>
                                                                    </div>
                                                                    <div class="row">
                                                                        <div class="col-md-3">
                                                                            <label for="numCompteBanque">No de compte bancaire</label>
                                                                        </div>
                                                                        <div class="col-md-9">
                                                                            <input type="text" name="numCompteBanque" value="" id="numCompteBanque" class="input_focus" />
                                                                            <span class="erreur"></span>
                                                                        </div>
                                                                    </div>
                                                                    <div class="row">
                                                                        <div class="col-md-3">
                                                                        </div>
                                                                        <div class="col-md-9">
                                                                            <input type="text" name="numCompteBanque_next" value="" id="numCompteBanque_next" class="input_focus" />
                                                                            <span class="erreur"></span>
                                                                        </div>
                                                                    </div>
                                                                    <div class="row">
                                                                        <div class="col-md-3">
                                                                            <label for="domiciliation">Domiciliation</label>
                                                                        </div>
                                                                        <div class="col-md-9">
                                                                            <input type="text" name="domiciliation" value="" id="domiciliation" class="input_focus" />
                                                                            <span class="erreur"></span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="tab-pane fade" id="tab-ListeTiers" role="tabpanel" aria-labelledby="ListeTiers-tab">
                                                            <div class="row">
                                                                <div class="col-md-12">
                                                                    <div class="col-md-12" style="max-height: 400px; overflow-y: auto">
                                                                        <table class="table-bordered tabList" id="tab_Tiers" width="100%" tabindex="0">
                                                                            <thead class="sticky-top bg-white">
                                                                                <tr>
                                                                                    <th data-field="code1">Compte Général</th>
                                                                                    <th data-field="code2">Compte auxiliaire</th>
                                                                                    <th data-field="code3">Compte ou Raison Sociale</th>
                                                                                    <th data-field="code4">Nom Contact</th>
                                                                                    <th data-field="code5">1 ère ligne d'adresse</th>
                                                                                    <th data-field="code6">2 ème ligne d'adresse</th>
                                                                                    <th data-field="code7">Pays</th>
                                                                                    <th data-field="code8">Ville</th>
                                                                                    <th data-field="code9">Téléphone</th>
                                                                                    <th data-field="code10">Fax</th>
                                                                                    <th data-field="code11">Email</th>
                                                                                    <th data-field="code12">Rib1</th>
                                                                                    <th data-field="code13">Rib2</th>
                                                                                    <th data-field="code14">Domiciliation</th>
                                                                                    <th data-field="code15">Echéance de paiement</th>
                                                                                    <th data-field="code16">jours le</th>
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
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
            break;
        case "StructPlanJournaux":
            formHTML = `
                        <div class="row justify-content-center" style="padding-top:2%">
                            <div class="col-md-11 pageView">
                                <div class="row">
                                    <div class="col-md-12" style="padding-bottom: 10px;border-bottom:1px solid #bdb8b8">
                                        <div class="container-fluid_top">
                                            <div class="header-row_top">
                                                <div class="title-container_top">
                                                    <strong id="titleStruct">BECK</strong>
                                                </div>
                                                <div id="buttonUser">

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form_padd">
                                            <div class="row justify-content-center" style="text-align:center">
                                                <div class="col-md-12">
                                                    <div class="alert_Param hide">
                                                        <span class="fas fa-exclamation-circle"></span>
                                                        <span class="result_Param"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <h5 style="color:#ff6a00">Saisie</h5>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <div class="row">
                                                        <div class="col-md-2">
                                                            <label for="code">Code</label>
                                                        </div>
                                                        <div class="col-md-4">
                                                            <input type="text" name="code" value="" id="code" class="input_focus" />
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-2">
                                                            <label for="libelle">Libellé</label>
                                                        </div>
                                                        <div class="col-md-4">
                                                            <input type="text" name="libelle" value="" id="libelle" class="input_focus" />
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                    <div class="row mb-2">
                                                        <div class="col-md-12">
                                                            <ul class="nav nav-underline fs-9" id="myTab" role="tablist">
                                                                <li class="nav-item" role="presentation"><a class="nav-link active" id="typeJournal-tab" data-bs-toggle="tab" href="#tab-typeJournal" role="tab" aria-controls="tab-typeJournal" aria-selected="true">Type du Journal</a></li>
                                                                <li class="nav-item" role="presentation"><a class="nav-link" id="GestionDevise-tab" data-bs-toggle="tab" href="#tab-GestionDevise" role="tab" aria-controls="tab-GestionDevise" aria-selected="false" tabindex="-1">Gestion des devises</a></li>
                                                            </ul>
                                                            <div class="tab-content mt-3" id="myTab3Content">
                                                                <div class="tab-pane fade active show" id="tab-typeJournal" role="tabpanel" aria-labelledby="typeJournal-tab">
                                                                    <div class="row" style="padding-bottom:10px">
                                                                        <div class="col-md-7">
                                                                            <div class="row">
                                                                                <div class="col-md-12">
                                                                                    <div class="form-check">
                                                                                        <label class="form-check-label" for="CheckJournal" style="cursor:pointer">
                                                                                            Journal de Trésorerie
                                                                                        </label>
                                                                                        <input class="form-check-input" type="checkbox" value="" id="CheckJournal" style="cursor:pointer">
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                <div class="col-md-5">
                                                                                    <label for="compteGene">Compte Général Associé</label>
                                                                                </div>
                                                                                <div class="col-md-7">
                                                                                    <select id="compteGene" class="input_focus choixSelect" style="width:100%">
                                                                                    </select>
                                                                                    <span class="erreur"></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                <div class="col-md-5">
                                                                                    <label for="signataire">Signataire</label>
                                                                                </div>
                                                                                <div class="col-md-7">
                                                                                    <select id="signataire" class="input_focus choixSelect" style="width:100%">
                                                                                    </select>
                                                                                    <span class="erreur"></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                <div class="col-md-12">
                                                                                    <div class="form-check">
                                                                                        <label class="form-check-label" for="excluDRF" style="cursor:pointer">
                                                                                            Exclu des DRF
                                                                                        </label>
                                                                                        <input class="form-check-input" type="checkbox" value="" id="excluDRF" style="cursor:pointer">
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                <div class="col-md-12">
                                                                                    <div class="form-check">
                                                                                        <label class="form-check-label" for="checkActif" style="cursor:pointer">
                                                                                            Actif
                                                                                        </label>
                                                                                        <input class="form-check-input" type="checkbox" value="" id="checkActif" style="cursor:pointer">
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="col-md-5" style="border-left:1px solid #e4dbdb">
                                                                            <div class="row">
                                                                                <div class="col-md-12">
                                                                                    <h6 style="color:#ff6a00">Automatisation des numéros de pièce compatible</h6>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                <div class="col-md-12">
                                                                                    <div class="row">
                                                                                        <div class="col-md-7">
                                                                                            <div class="form-check">
                                                                                                <label class="form-check-label" for="checkInclu_Pref" style="cursor:pointer">
                                                                                                    Inclure un préfixe
                                                                                                </label>
                                                                                                <input class="form-check-input disabledCheck" type="checkbox" value="" id="checkInclu_Pref" style="cursor:pointer">
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-md-5">
                                                                                            <input type="text" name="valInclu_Pref" value="" id="valInclu_Pref" class="input_focus disabledCheck" />
                                                                                            <span class="erreur"></span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="row">
                                                                                        <div class="col-md-12">
                                                                                            <div class="form-check">
                                                                                                <label class="form-check-label" for="checkInclu_year" style="cursor:pointer">
                                                                                                    Inclure l'année
                                                                                                </label>
                                                                                                <input class="form-check-input disabledCheck" type="checkbox" value="" id="checkInclu_year" style="cursor:pointer">
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="row">
                                                                                        <div class="col-md-12">
                                                                                            <div class="form-check">
                                                                                                <label class="form-check-label" for="checkInclu_month" style="cursor:pointer">
                                                                                                    Inclure le mois
                                                                                                </label>
                                                                                                <input class="form-check-input disabledCheck" type="checkbox" value="" id="checkInclu_month" style="cursor:pointer">
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="row">
                                                                                        <div class="col-md-8">
                                                                                            <label for="increm_num">Incrémentation (Numérique)</label>
                                                                                        </div>
                                                                                        <div class="col-md-4">
                                                                                            <input type="number" name="increm_num" value="" id="increm_num" class="input_focus disabledCheck" />
                                                                                            <span class="erreur"></span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="tab-pane fade" id="tab-GestionDevise" role="tabpanel" aria-labelledby="GestionDevise-tab">
                                                                    <div class="row" style="padding-bottom:10px">
                                                                        <div class="col-md-8">
                                                                            <div class="row justify-content-center" style="text-align:center">
                                                                                <div class="col-md-3">
                                                                                    <div class="form-check">
                                                                                        <label class="form-check-label" for="JournalGerDevise" style="cursor:pointer">
                                                                                            Journal Géré en devises
                                                                                        </label>
                                                                                        <input class="form-check-input disabledCheck" type="checkbox" value="" id="JournalGerDevise" style="cursor:pointer">
                                                                                    </div>
                                                                                </div>
                                                                                <div class="col-md-4">
                                                                                    <label for="codeDevise">Code de devises (si fixe)</label>
                                                                                </div>
                                                                                <div class="col-md-2">
                                                                                    <input type="number" name="codeDevise" value="" id="codeDevise" class="input_focus disabledCheck" />
                                                                                    <span class="erreur"></span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id="partieTab">

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>                        
                        `;
            break;
        case "StructBailleurFond":
            formHTML = `
                        <div class="row justify-content-center" style="padding-top:2%">
                            <div class="col-md-11 pageView">
                                <div class="row">
                                    <div class="col-md-12" style="padding-bottom: 10px;border-bottom:1px solid #bdb8b8">
                                        <div class="container-fluid_top">
                                            <div class="header-row_top">
                                                <div class="title-container_top">
                                                    <strong id="titleStruct">BECK</strong>
                                                </div>
                                                <div id="buttonUser">

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form_padd">
                                            <div class="row justify-content-center" style="text-align:center">
                                                <div class="col-md-12">
                                                    <div class="alert_Param hide">
                                                        <span class="fas fa-exclamation-circle"></span>
                                                        <span class="result_Param"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <h5 style="color:#ff6a00">Saisie</h5>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <div class="row">
                                                        <div class="col-md-2">
                                                            <label for="code">Code</label>
                                                        </div>
                                                        <div class="col-md-4">
                                                            <input type="text" name="code" value="" id="code" class="input_focus" />
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-2">
                                                            <label for="libelle">Libellé</label>
                                                        </div>
                                                        <div class="col-md-4">
                                                            <input type="text" name="libelle" value="" id="libelle" class="input_focus" />
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                    <div class="row mb-2">
                                                        <div class="col-md-12">
                                                            <ul class="nav nav-underline fs-9" id="myTab" role="tablist">
                                                                <li class="nav-item" role="presentation"><a class="nav-link active" id="adressePostal-tab" data-bs-toggle="tab" href="#tab-adressePostal" role="tab" aria-controls="tab-adressePostal" aria-selected="true">Adresse Postale</a></li>
                                                                <li class="nav-item" role="presentation"><a class="nav-link" id="TelFaxEmail-tab" data-bs-toggle="tab" href="#tab-TelFaxEmail" role="tab" aria-controls="tab-TelFaxEmail" aria-selected="false" tabindex="-1">Tél - Fax - Email</a></li>
                                                            </ul>
                                                            <div class="tab-content mt-3" id="myTab4Content">
                                                                <div class="tab-pane fade active show" id="tab-adressePostal" role="tabpanel" aria-labelledby="adressePostal-tab">
                                                                    <div class="row" style="padding-bottom:10px">
                                                                        <div class="col-md-12">
                                                                            <div class="row">
                                                                                <div class="col-md-3">
                                                                                    <label for="1_LigneAdresse">1 ère ligne d'adresse</label>
                                                                                </div>
                                                                                <div class="col-md-9">
                                                                                    <input type="text" name="1_LigneAdresse" value="" id="1_LigneAdresse" class="input_focus disabledCheck" />
                                                                                    <span class="erreur"></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                <div class="col-md-3">
                                                                                    <label for="2_LigneAdresse">2 ème ligne d'adresse</label>
                                                                                </div>
                                                                                <div class="col-md-9">
                                                                                    <input type="text" name="2_LigneAdresse" value="" id="2_LigneAdresse" class="input_focus disabledCheck" />
                                                                                    <span class="erreur"></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                <div class="col-md-3">
                                                                                    <label for="ville">Ville</label>
                                                                                </div>
                                                                                <div class="col-md-4">
                                                                                    <input type="text" name="ville" value="" id="ville" class="input_focus disabledCheck" />
                                                                                    <span class="erreur"></span>
                                                                                </div>
                                                                                <div class="col-md-2">
                                                                                    <label for="pays">Pays</label>
                                                                                </div>
                                                                                <div class="col-md-3">
                                                                                    <select id="pays" class="input_focus choixSelect disabledCheck" style="width:100%">
                                                                                    </select>
                                                                                    <span class="erreur"></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                <div class="col-md-3">
                                                                                    <label for="procedureFinance">Procédure financière</label>
                                                                                </div>
                                                                                <div class="col-md-9">
                                                                                    <select id="procedureFinance" class="input_focus choixSelect disabledCheck" style="width:100%">
                                                                                    </select>
                                                                                    <span class="erreur"></span>
                                                                                </div>
                                                                            </div>

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="tab-pane fade" id="tab-TelFaxEmail" role="tabpanel" aria-labelledby="TelFaxEmail-tab">
                                                                    <div class="row" style="padding-bottom:10px">
                                                                        <div class="col-md-12">
                                                                            <div class="row">
                                                                                <div class="col-md-3">
                                                                                    <label for="telephone">Téléphone</label>
                                                                                </div>
                                                                                <div class="col-md-6">
                                                                                    <input type="text" name="telephone" value="" id="telephone" class="input_focus disabledCheck" />
                                                                                    <span class="erreur"></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                <div class="col-md-3">
                                                                                    <label for="fax">Fax</label>
                                                                                </div>
                                                                                <div class="col-md-6">
                                                                                    <input type="text" name="fax" value="" id="fax" class="input_focus disabledCheck" />
                                                                                    <span class="erreur"></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                <div class="col-md-3">
                                                                                    <label for="email">Email</label>
                                                                                </div>
                                                                                <div class="col-md-6">
                                                                                    <input type="text" name="email" value="" id="email" class="input_focus disabledCheck" />
                                                                                    <span class="erreur"></span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id="partieTab">

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
            break;
        case "StructConventions":
            formHTML = `
                        <div class="row justify-content-center" style="padding-top:2%">
                            <div class="col-md-11 pageView">
                                <div class="row">
                                    <div class="col-md-12" style="padding-bottom: 10px;border-bottom:1px solid #bdb8b8">
                                        <div class="container-fluid_top">
                                            <div class="header-row_top">
                                                <div class="title-container_top">
                                                    <strong id="titleStruct">BECK</strong>
                                                </div>
                                                <div id="buttonUser">

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form_padd">
                                            <div class="row justify-content-center" style="text-align:center">
                                                <div class="col-md-12">
                                                    <div class="alert_Param hide">
                                                        <span class="fas fa-exclamation-circle"></span>
                                                        <span class="result_Param"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <h5 style="color:#ff6a00">Saisie</h5>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <div class="row">
                                                        <div class="col-md-2">
                                                            <label for="BailleurFond">Bailleur de Fond</label>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <select id="BailleurFond" class="input_focus choixSelect" style="width:100%">
                                                            </select>
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-2">
                                                            <label for="code">Code</label>
                                                        </div>
                                                        <div class="col-md-4">
                                                            <input type="text" name="code" value="" id="code" class="input_focus disabledCheck" />
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-2">
                                                            <label for="libelle">Libellé</label>
                                                        </div>
                                                        <div class="col-md-4">
                                                            <input type="text" name="libelle" value="" id="libelle" class="input_focus disabledCheck" />
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-3">
                                                            <div class="form-check">
                                                                <input class="form-check-input disabledCheck" type="checkbox" value="" id="checkActif" style="cursor:pointer">
                                                                <label class="form-check-label" for="checkActif" style="cursor:pointer">
                                                                    Actif
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="row mb-2">
                                                        <div class="col-md-12">
                                                            <ul class="nav nav-underline fs-9" id="myTab" role="tablist">
                                                                <li class="nav-item" role="presentation"><a class="nav-link active" id="CommentaireDRF-tab" data-bs-toggle="tab" href="#tab-CommentaireDRF" role="tab" aria-controls="tab-CommentaireDRF" aria-selected="true">Commentaires DRF</a></li>
                                                                <li class="nav-item" role="presentation"><a class="nav-link" id="signataires-tab" data-bs-toggle="tab" href="#tab-signataires" role="tab" aria-controls="tab-signataires" aria-selected="false" tabindex="-1">Signataires</a></li>
                                                                <li class="nav-item" role="presentation"><a class="nav-link" id="Devise-tab" data-bs-toggle="tab" href="#tab-Devise" role="tab" aria-controls="tab-Devise" aria-selected="false" tabindex="-1">Devise</a></li>
                                                            </ul>
                                                            <div class="tab-content mt-3" id="myTab5Content">
                                                                <div class="tab-pane fade active show" id="tab-CommentaireDRF" role="tabpanel" aria-labelledby="CommentaireDRF-tab">
                                                                    <div class="row" style="padding-bottom:10px">
                                                                        <div class="col-md-12">
                                                                            <div class="row">
                                                                                <div class="col-md-1">
                                                                                    <label for="1_LigneAdresse">1</label>
                                                                                </div>
                                                                                <div class="col-md-8">
                                                                                    <input type="text" name="num_1" value="" id="num_1" class="input_focus disabledCheck" />
                                                                                    <span class="erreur"></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                <div class="col-md-1">
                                                                                    <label for="num_2">2</label>
                                                                                </div>
                                                                                <div class="col-md-8">
                                                                                    <input type="text" name="num_2" value="" id="num_2" class="input_focus disabledCheck" />
                                                                                    <span class="erreur"></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                <div class="col-md-1">
                                                                                    <label for="num_3">3</label>
                                                                                </div>
                                                                                <div class="col-md-8">
                                                                                    <input type="text" name="num_3" value="" id="num_3" class="input_focus disabledCheck" />
                                                                                    <span class="erreur"></span>
                                                                                </div>
                                                                            </div>

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="tab-pane fade" id="tab-signataires" role="tabpanel" aria-labelledby="signataires-tab">
                                                                    <div class="row" style="padding-bottom:10px">
                                                                        <div class="col-md-12">
                                                                            <div class="row">
                                                                                <div class="col-md-2">
                                                                                    <label for="codesignat">Code</label>
                                                                                </div>
                                                                                <div class="col-md-8">
                                                                                    <select id="codesignat" class="input_focus choixSelect disabledCheck" style="width:100%">
                                                                                    </select>
                                                                                    <span class="erreur"></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                <div class="col-md-6">
                                                                                    <div class="row justify-content-center" style="text-align:center">
                                                                                        <div class="col-md-12">
                                                                                            <h5>Nom</h5>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="row">
                                                                                        <div class="col-md-1">
                                                                                            <label for="signature_1">1</label>
                                                                                        </div>
                                                                                        <div class="col-md-11">
                                                                                            <input type="text" name="signature_1" value="" id="signature_1" class="input_focus disabledCheck" />
                                                                                            <span class="erreur"></span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="row">
                                                                                        <div class="col-md-1">
                                                                                            <label for="signature_2">2</label>
                                                                                        </div>
                                                                                        <div class="col-md-11">
                                                                                            <input type="text" name="signature_2" value="" id="signature_2" class="input_focus disabledCheck" />
                                                                                            <span class="erreur"></span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="row">
                                                                                        <div class="col-md-1">
                                                                                            <label for="signature_3">3</label>
                                                                                        </div>
                                                                                        <div class="col-md-11">
                                                                                            <input type="text" name="signature_3" value="" id="signature_3" class="input_focus disabledCheck" />
                                                                                            <span class="erreur"></span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="row">
                                                                                        <div class="col-md-1">
                                                                                            <label for="signature_4">4</label>
                                                                                        </div>
                                                                                        <div class="col-md-11">
                                                                                            <input type="text" name="signature_4" value="" id="signature_4" class="input_focus disabledCheck" />
                                                                                            <span class="erreur"></span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="col-md-6">
                                                                                    <div class="row justify-content-center" style="text-align:center">
                                                                                        <div class="col-md-12">
                                                                                            <h5>Poste Occupé</h5>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="row">
                                                                                        <div class="col-md-12">
                                                                                            <input type="text" name="signature_1_" value="" id="signature_1_" class="input_focus disabledCheck" />
                                                                                            <span class="erreur"></span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="row">
                                                                                        <div class="col-md-12">
                                                                                            <input type="text" name="signature_2_" value="" id="signature_2_" class="input_focus disabledCheck" />
                                                                                            <span class="erreur"></span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="row">
                                                                                        <div class="col-md-12">
                                                                                            <input type="text" name="signature_3_" value="" id="signature_3_" class="input_focus disabledCheck" />
                                                                                            <span class="erreur"></span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="row">
                                                                                        <div class="col-md-12">
                                                                                            <input type="text" name="signature_4_" value="" id="signature_4_" class="input_focus disabledCheck" />
                                                                                            <span class="erreur"></span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="tab-pane fade" id="tab-Devise" role="tabpanel" aria-labelledby="Devise-tab">
                                                                    <div class="row" style="padding-bottom:10px">
                                                                        <div class="col-md-12">
                                                                            <div class="row">
                                                                                <div class="col-md-12">
                                                                                    <h5 style="color:#ff6a00"><u>Monnnaie</u></h5>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                <div class="col-md-3">
                                                                                    <label for="suivi1_">Suivi (1ère)</label>
                                                                                </div>
                                                                                <div class="col-md-6">
                                                                                    <select id="suivi1_" class="input_focus choixSelect disabledCheck" style="width:100%">
                                                                                    </select>
                                                                                    <span class="erreur"></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                <div class="col-md-3">
                                                                                    <label for="suivi2_">Suivi (2ème)</label>
                                                                                </div>
                                                                                <div class="col-md-6">
                                                                                    <select id="suivi2_" class="input_focus choixSelect disabledCheck" style="width:100%">
                                                                                    </select>
                                                                                    <span class="erreur"></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                <div class="col-md-3">
                                                                                    <label for="emissionMe">Emission Mémoire</label>
                                                                                </div>
                                                                                <div class="col-md-6">
                                                                                    <select id="emissionMe" class="input_focus choixSelect disabledCheck" style="width:100%">
                                                                                    </select>
                                                                                    <span class="erreur"></span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="partieTab">

                                </div>
                            </div>
                        </div>
                      `;
            break;
        case "StructSignataires":
            formHTML = `
                        <div class="row justify-content-center" style="padding-top:2%">
                            <div class="col-md-11 pageView">
                                <div class="row">
                                    <div class="col-md-12" style="padding-bottom: 10px;border-bottom:1px solid #bdb8b8">
                                        <div class="container-fluid_top">
                                            <div class="header-row_top">
                                                <div class="title-container_top">
                                                    <strong id="titleStruct">BECK</strong>
                                                </div>
                                                <div id="buttonUser">

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form_padd">
                                            <div class="row justify-content-center" style="text-align:center">
                                                <div class="col-md-12">
                                                    <div class="alert_Param hide">
                                                        <span class="fas fa-exclamation-circle"></span>
                                                        <span class="result_Param"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <h5 style="color:#ff6a00">Saisie</h5>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <div class="row">
                                                        <div class="col-md-2">
                                                            <label for="code">Code</label>
                                                        </div>
                                                        <div class="col-md-4">
                                                            <input type="text" name="code" value="" id="code" class="input_focus disabledCheck" />
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-2">
                                                            <label for="libelle">Libellé</label>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <input type="text" name="libelle" value="" id="libelle" class="input_focus disabledCheck" />
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <div class="row justify-content-center" style="text-align:center">
                                                                <div class="col-md-12">
                                                                    <strong>Nom</strong>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-md-12">
                                                                    <input type="text" name="nom_1" value="" id="nom_1" class="input_focus disabledCheck" />
                                                                    <span class="erreur"></span>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-md-12">
                                                                    <input type="text" name="nom_2" value="" id="nom_2" class="input_focus disabledCheck" />
                                                                    <span class="erreur"></span>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-md-12">
                                                                    <input type="text" name="nom_3" value="" id="nom_3" class="input_focus disabledCheck" />
                                                                    <span class="erreur"></span>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-md-12">
                                                                    <input type="text" name="nom_4" value="" id="nom_4" class="input_focus disabledCheck" />
                                                                    <span class="erreur"></span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <div class="row justify-content-center" style="text-align:center">
                                                                <div class="col-md-12">
                                                                    <strong>Poste</strong>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-md-12">
                                                                    <input type="text" name="poste_1" value="" id="poste_1" class="input_focus disabledCheck" />
                                                                    <span class="erreur"></span>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-md-12">
                                                                    <input type="text" name="poste_2" value="" id="poste_2" class="input_focus disabledCheck" />
                                                                    <span class="erreur"></span>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-md-12">
                                                                    <input type="text" name="poste_3" value="" id="poste_3" class="input_focus disabledCheck" />
                                                                    <span class="erreur"></span>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-md-12">
                                                                    <input type="text" name="poste_4" value="" id="poste_4" class="input_focus disabledCheck" />
                                                                    <span class="erreur"></span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id="partieTab">

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>                       
                        `;
            break;
        case "StructVentilation":
            formHTML = `
                        <div class="row justify-content-center" style="padding-top:2%">
                            <div class="col-md-11 pageView">
                                <div class="row">
                                    <div class="col-md-12" style="padding-bottom: 10px;border-bottom:1px solid #bdb8b8">
                                        <div class="container-fluid_top">
                                            <div class="header-row_top">
                                                <div class="title-container_top">
                                                    <strong id="titleStruct">BECK</strong>
                                                </div>
                                                <div id="buttonUser">

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form_padd">
                                            <div class="row justify-content-center" style="text-align:center">
                                                <div class="col-md-12">
                                                    <div class="alert_Param hide">
                                                        <span class="fas fa-exclamation-circle"></span>
                                                        <span class="result_Param"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <h5 style="color:#ff6a00">Saisie</h5>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <div class="row">
                                                        <div class="col-md-3">
                                                            <label for="categorieFinan">Catégorie Financière</label>
                                                        </div>
                                                        <div class="col-md-4">
                                                            <select id="categorieFinan" class="input_focus choixSelect disabledCheck" style="width:100%">
                                                            </select>
                                                            <span class="erreur"></span>
                                                        </div>
                                                        <div class="col-md-2">
                                                            <div class="form-check">
                                                                <input class="form-check-input disabledCheck" type="checkbox" value="" id="checkActif" style="cursor:pointer">
                                                                <label class="form-check-label" for="checkActif" style="cursor:pointer">
                                                                    Actif
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-12">
                                                            <table class="tabList" style="width:100%" id="tabCategorieFirst">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Catégorie</th>
                                                                        <th>Code</th>
                                                                        <th>Taux - Local</th>
                                                                        <th>Taux - Devis</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr>
                                                                        <td>1ère catégorie</td>
                                                                        <td style="width:60%"><select id="catego_1" class="input_focus choixSelect disabledCheck" style="width:100%"></select></td>
                                                                        <td style="width:8%"><input type="text" value="0,000" class="input_focus disabledCheck"></td>
                                                                        <td style="width:8%"><input type="text" value="0,000" class="input_focus disabledCheck"></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>2ème catégorie</td>
                                                                        <td style="width:60%"><select id="catego_2" class="input_focus choixSelect disabledCheck" style="width:100%"></select></td>
                                                                        <td style="width:8%"><input type="text" value="0,000" class="input_focus disabledCheck"></td>
                                                                        <td style="width:8%"><input type="text" value="0,000" class="input_focus disabledCheck"></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>3ème catégorie</td>
                                                                        <td style="width:60%"><select id="catego_3" class="input_focus choixSelect disabledCheck" style="width:100%"></select></td>
                                                                        <td style="width:8%"><input type="text" value="0,000" class="input_focus disabledCheck"></td>
                                                                        <td style="width:8%"><input type="text" value="0,000" class="input_focus disabledCheck"></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>4ème catégorie</td>
                                                                        <td style="width:60%"><select id="catego_4" class="input_focus choixSelect disabledCheck" style="width:100%"></select></td>
                                                                        <td style="width:8%"><input type="text" value="0,000" class="input_focus disabledCheck"></td>
                                                                        <td style="width:8%"><input type="text" value="0,000" class="input_focus disabledCheck"></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>5ème catégorie</td>
                                                                        <td style="width:60%"><select id="catego_5" class="input_focus choixSelect disabledCheck" style="width:100%"></select></td>
                                                                        <td style="width:8%"><input type="text" value="0,000" class="input_focus disabledCheck"></td>
                                                                        <td style="width:8%"><input type="text" value="0,000" class="input_focus disabledCheck"></td>
                                                                    </tr>
                                                                    <tr style="background-color: #77B5FE;color:#fff">
                                                                        <td class="totaux" colspan="2" style="text-align:center"><strong>Totaux</strong></td>
                                                                        <td style="width:8%" class="totaux"><input type="text" disabled value="0,000" readonly></td>
                                                                        <td style="width:8%" class="totaux"><input type="text" disabled value="0,000" readonly></td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div><hr/>
                                <div id="partieTab">

                                </div>
                            </div>
                        </div>                        
                        `;
            break;
        case "StructCategorieFinance":
            formHTML = `
                        <div class="row justify-content-center" style="padding-top:2%">
                            <div class="col-md-11 pageView">
                                <div class="row">
                                    <div class="col-md-12" style="padding-bottom: 10px;border-bottom:1px solid #bdb8b8">
                                        <div class="container-fluid_top">
                                            <div class="header-row_top">
                                                <div class="title-container_top">
                                                    <strong id="titleStruct">BECK</strong>
                                                </div>
                                                <div id="buttonUser">

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form_padd">
                                            <div class="row justify-content-center" style="text-align:center">
                                                <div class="col-md-12">
                                                    <div class="alert_Param hide">
                                                        <span class="fas fa-exclamation-circle"></span>
                                                        <span class="result_Param"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <h5 style="color:#ff6a00">Saisie</h5>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <div class="row">
                                                        <div class="col-md-3">
                                                            <label for="codeConventionF">Code de la convention</label>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <select id="codeConventionF" class="input_focus choixSelect disabledCheck" style="width:100%">
                                                            </select>
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-3">
                                                            <label for="codeCategorie">Code de la catégorie</label>
                                                        </div>
                                                        <div class="col-md-4">
                                                            <input type="text" name="codeCategorie" value="" id="codeCategorie" class="input_focus disabledCheck" />
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                    <div class="row mb-2">
                                                        <div class="col-md-12">
                                                            <ul class="nav nav-underline fs-9" id="myTab" role="tablist">
                                                                <li class="nav-item" role="presentation"><a class="nav-link active" id="Detail-tab" data-bs-toggle="tab" href="#tab-Detail" role="tab" aria-controls="tab-Detail" aria-selected="true">Détails</a></li>
                                                                <li class="nav-item" role="presentation"><a class="nav-link" id="Liste-tab" data-bs-toggle="tab" href="#tab-Liste" role="tab" aria-controls="tab-Liste" aria-selected="false" tabindex="-1">Liste</a></li>
                                                            </ul>
                                                            <div class="tab-content mt-3" id="myTab6Content">
                                                                <div class="tab-pane fade active show" id="tab-Detail" role="tabpanel" aria-labelledby="Detail-tab">
                                                                    <div class="row" style="padding-bottom:10px">
                                                                        <div class="col-md-12">
                                                                            <div class="row">
                                                                                <div class="col-md-12">
                                                                                    <h5 style="color:#ff6a00"><u>Caractéristiques</u></h5>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                <div class="col-md-6">
                                                                                    <div class="row">
                                                                                        <div class="col-md-4">
                                                                                            <label for="libelleCat">Libellé de la catégorie</label>
                                                                                        </div>
                                                                                        <div class="col-md-8">
                                                                                            <input type="text" name="libelleCat" value="" id="libelleCat" class="input_focus disabledCheck" />
                                                                                            <span class="erreur"></span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="row">
                                                                                        <div class="col-md-6">
                                                                                            <div class="form-check">
                                                                                                <input class="form-check-input disabledCheck" type="checkbox" value="" id="categorieTaxe" style="cursor:pointer">
                                                                                                <label class="form-check-label" for="categorieTaxe" style="cursor:pointer">
                                                                                                    Catégorie représentant une TAXE
                                                                                                </label>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="col-md-6" style="border-left:1px solid #d0cccc;">
                                                                                    <div class="row">
                                                                                        <div class="col-md-4">
                                                                                            <label for="modeleEtat">Modèle d'état</label>
                                                                                        </div>
                                                                                        <div class="col-md-8">
                                                                                            <select id="modeleEtat" class="input_focus choixSelect disabledCheck" style="width:100%">
                                                                                            </select>
                                                                                            <span class="erreur"></span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="row">
                                                                                        <div class="col-md-6">
                                                                                            <div class="form-check">
                                                                                                <input class="form-check-input disabledCheck" type="checkbox" value="" id="checkActif" style="cursor:pointer">
                                                                                                <label class="form-check-label" for="checkActif" style="cursor:pointer">
                                                                                                    Actif
                                                                                                </label>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row mb-2">
                                                                                <div class="col-md-12">
                                                                                    <h5 style="color:#ff6a00"><u>LIGNES rattaché(e)s</u></h5>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                <div class="col-md-5">
                                                                                    <div class="list-container">
                                                                                        <label><strong>LIGNE (Liste Entière)</strong></label><br>
                                                                                        <select id="listeEntiere" multiple style="width:100%;height:150px;overflow-y: auto;border:1px solid #d0cccc;">
                                                                                            <option>62211 Acquisition terrains</option>
                                                                                            <option>62212 Viabilisation et Aménagement des terres</option>
                                                                                            <option>62219 Autres terrains</option>
                                                                                            <option>62241 BASSINS</option>
                                                                                            <option>62311 Bâtiments Administratifs à usage de bureaux</option>
                                                                                            <option>62312 Construction de d’Angars pour le Stockage d</option>
                                                                                            <option>62319 Autres bâtiments à usage technique</option>
                                                                                            <option>62341 OUVRAGES DE TRANSPORTS</option>
                                                                                            <option>62343 Forage</option>
                                                                                        </select>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="col-md-1">
                                                                                    <div class="list-buttons">
                                                                                        <button id="btnAnalyt" onclick="moveSelected('listeEntiere', 'listeSelection')">-&gt;</button>
                                                                                        <button id="btnBudget" onclick="moveSelected('listeSelection', 'listeEntiere')">&lt;-</button>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="col-md-5">
                                                                                    <div class="list-container">
                                                                                        <label><strong>LIGNE Sélectionné(e)s</strong></label><br>
                                                                                        <select id="listeSelection" multiple style="width:100%;height:150px;border:1px solid #d0cccc;"></select>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="tab-pane fade" id="tab-Liste" role="tabpanel" aria-labelledby="Liste-tab">
                                                                    <div class="row">
                                                                        <div class="col-md-12" style="max-height: 200px; overflow-y: auto">
                                                                            <table class="table-bordered tabList" id="tab_${IDButton}" width="100%" tabindex="0">
                                                                                <thead class="sticky-top bg-white">
                                                                                    <tr>
                                                                                        <th data-field="code1">Code de la catégorie</th>
                                                                                        <th data-field="code2">Libellé de la catégorie</th>
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
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>                        
                        `;
            break;
        case "StructSousCategorie":
            formHTML = `
                        <div class="row justify-content-center" style="padding-top:2%">
                            <div class="col-md-11 pageView">
                                <div class="row">
                                    <div class="col-md-12" style="padding-bottom: 10px;border-bottom:1px solid #bdb8b8">
                                        <div class="container-fluid_top">
                                            <div class="header-row_top">
                                                <div class="title-container_top">
                                                    <strong id="titleStruct">BECK</strong>
                                                </div>
                                                <div id="buttonUser">

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form_padd">
                                            <div class="row justify-content-center" style="text-align:center">
                                                <div class="col-md-12">
                                                    <div class="alert_Param hide">
                                                        <span class="fas fa-exclamation-circle"></span>
                                                        <span class="result_Param"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-4">
                                                    <label for="codeConvention">Code de la convention</label>
                                                </div>
                                                <div class="col-md-8">
                                                    <select class="input_focus choixSelect" style="width:100%" id="codeConvention">
                                                    </select>
                                                    <span class="erreur"></span>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-4">
                                                    <label for="codeCategorie">Code de la catégorie</label>
                                                </div>
                                                <div class="col-md-8">
                                                    <select class="input_focus choixSelect" style="width:100%" id="codeCategorie">
                                                    </select>
                                                    <span class="erreur"></span>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-4">
                                                    <label for="codeSousCat">Code Sous-Catégorie</label>
                                                </div>
                                                <div class="col-md-5">
                                                    <input type="text" name="code" value="" maxlength="3" id="codeSousCat" class="input_focus disabled_me" />
                                                    <span class="erreur"></span>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-4">
                                                    <label for="libelle">Libellé</label>
                                                </div>
                                                <div class="col-md-8">
                                                    <input type="text" name="libelle" value="" id="libelle" class="input_focus disabled_me" />
                                                    <span class="erreur"></span>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-3">
                                                    <div class="form-check">
                                                        <input class="form-check-input disabled_me" id="checkActif" type="checkbox" value="" style="cursor:pointer"/>
                                                        <label class="form-check-label" style="cursor:pointer" for="checkActif"><strong>Actif</strong></label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div id="partieTab" style="padding-top:10px">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
            break;
    }
    container.insertAdjacentHTML("beforeend", formHTML);
    buttonAction();
    let button = document.getElementById(IDButton);
    document.getElementById('titleStruct').textContent = button.textContent;
    const groupeBase = [
        "StructPlanBudget", "StructActivite", "StructZone", "StructEmplacements",
        "StructPlan6", "StructPlanExtP1", "StructPlanExtP2", "StructPlanExtP3",
        "StructPlanExtP4", "StructPlanCompt", "StructCorrespondPlan",
        "StructPlanJournaux", "StructBailleurFond", "StructConventions",
        "StructSignataires", "StructVentilation", "StructSousCategorie"
    ];

    const groupeAvecNiveaux = [
        "StructPlanBudget", "StructActivite", "StructZone", "StructEmplacements",
        "StructPlan6", "StructPlanExtP1", "StructPlanExtP2", "StructPlanExtP3",
        "StructPlanExtP4", "StructPlanCompt"
    ];

    const groupeJusteDataNiveau = ["StructSousCategorie"];
    const groupeControleOnly = ["StructPlanTier", "StructCategorieFinance"];

    // Exécution
    if (groupeBase.includes(IDButton)) {
        vueTable();
        controleInput();
    }

    if (groupeAvecNiveaux.includes(IDButton)) {
        vueFirstNiveau();
        vueLastNiveau();
        DataNiveau();
    }

    if (groupeJusteDataNiveau.includes(IDButton)) {
        DataNiveau();
    }

    if (groupeControleOnly.includes(IDButton)) {
        controleInput();
    }


}
function buttonAction() {
    let container = document.getElementById('buttonUser');
    container.innerHTML = "";
    let formHTML = "";
    switch (IDButton) {
        case "StructPlanBudget":
        case "StructActivite":
        case "StructZone":
        case "StructEmplacements":
        case "StructPlan6":
        case "StructPlanCompt":
            formHTML = `
                            <button class="btn_action" type="button" id="Imprimer" onclick="Imprimer()">Imprimer</button>
                            <button class="btn_action" type="button" id="Voir" onclick="Voir()">Voir</button>
                            <button class="btn_action" type="button" id="TXT" onclick="TXT()">TXT</button>
                            <button class="btn_action" type="button" id="excel" onclick="excel()">Excel</button>
                            <button class="btn_action" type="button" id="Importation" onclick="Importation()">Importation</button>
                            <button class="btn_action" type="button" id="Ajouter" onclick="Ajouter()">Ajouter</button>
                            <button class="btn_action" type="button" id="Modifier" onclick="Modifier()">Modifier</button>
                            <button class="btn_action" type="button" id="Supprimer" onclick="Supprimer()">Supprimer</button>
                            <button class="btn_action" type="button" id="Annuler" onclick="Annuler()">Annuler</button>
                            <button class="btn_action" type="button" id="closeSt">Fermer</button>                           
                        `;
            break;
        case "StructBailleurFond":
        case "StructConventions":
            formHTML = `
                        <button class="btn_action" type="button" id="Imprimer" onclick="Imprimer()">Imprimer</button>
                        <button class="btn_action" type="button" id="Voir" onclick="Voir()">Voir</button>
                        <button class="btn_action" type="button" id="Fiche" onclick="Fiche()">Fiche</button>
                        <button class="btn_action" type="button" id="Ajouter" onclick="Ajouter()">Ajouter</button>
                        <button class="btn_action" type="button" id="Modifier" onclick="Modifier()">Modifier</button>
                        <button class="btn_action" type="button" id="Supprimer" onclick="Supprimer()">Supprimer</button>
                        <button class="btn_action" type="button" id="Annuler" onclick="Annuler()">Annuler</button>
                        <button class="btn_action" type="button" id="closeSt">Fermer</button>                              
                        `;
            break;
        case "StructPlanExtP1":
        case "StructPlanExtP2":
        case "StructPlanExtP3":
        case "StructPlanExtP4":
        case "StructCorrespondPlan":
        case "StructSousCategorie":
        case "StructPlanJournaux":
        case "StructCategorieFinance":
            formHTML = ` 
                            <button class="btn_action" type="button" id="Imprimer" onclick="Imprimer()">Imprimer</button>
                            <button class="btn_action" type="button" id="Voir" onclick="Imprimer()">Voir</button>
                            <button class="btn_action" type="button" id="Ajouter" onclick="Ajouter()">Ajouter</button>
                            <button class="btn_action" type="button" id="Modifier" onclick="Modifier()">Modifier</button>
                            <button class="btn_action" type="button" id="Supprimer" onclick="Supprimer()">Supprimer</button>
                            <button class="btn_action" type="button" id="Annuler" onclick="Annuler()">Annuler</button>
                            <button class="btn_action" type="button" id="closeSt">Fermer</button>

                        `;
            break;
        case "StructPlanTier":
            formHTML = `
                        <button class="btn_action" type="button" id="Imprimer" onclick="Imprimer()">Imprimer</button>
                        <button class="btn_action" type="button" id="Voir" onclick="Voir()">Voir</button>
                        <button class="btn_action" type="button" id="Duplication" onclick="Duplication()">Duplication</button>
                        <button class="btn_action" type="button" id="Recherche" onclick="Recherche()">Recherche</button>
                        <button class="btn_action" type="button" id="Importation" onclick="Importation()">Importation</button>
                        <button class="btn_action" type="button" id="Ajouter" onclick="Ajouter()">Ajouter</button>
                        <button class="btn_action" type="button" id="Modifier" onclick="Modifier()">Modifier</button>
                        <button class="btn_action" type="button" id="Supprimer" onclick="Supprimer()">Supprimer</button>
                        <button class="btn_action" type="button" id="Annuler" onclick="Annuler()">Annuler</button>
                        <button class="btn_action" type="button" id="closeSt">Fermer</button>                              
                        `;
            break;
        case "StructVentilation":
        case "StructSignataires":
            formHTML = `
                        <button class="btn_action" type="button" id="Liste" onclick="Liste()">Liste</button>
                        <button class="btn_action" type="button" id="Ajouter" onclick="Ajouter()">Ajouter</button>
                        <button class="btn_action" type="button" id="Modifier" onclick="Modifier()">Modifier</button>
                        <button class="btn_action" type="button" id="Supprimer" onclick="Supprimer()">Supprimer</button>
                        <button class="btn_action" type="button" id="Annuler" onclick="Annuler()">Annuler</button>
                        <button class="btn_action" type="button" id="closeSt">Fermer</button>                              
                        `;
            break;
    }
    container.insertAdjacentHTML("beforeend", formHTML);
}
function vueTable() {
    let container = document.getElementById('partieTab');
    container.innerHTML = "";
    let formHTML = "";
    switch (IDButton) {
        case "StructPlanBudget":
        case "StructActivite":
        case "StructZone":
        case "StructEmplacements":
        case "StructPlan6":
        case "StructPlanExtP1":
        case "StructPlanExtP2":
        case "StructPlanExtP3":
        case "StructPlanExtP4":
            formHTML = `
                    <div class="row">
                        <div class="col-md-12">
                            <table style="position: sticky;top: 0;z-index: 1;" class="table-bordered tabList" id="tab_${IDButton}" width="100%" tabindex="0">
                                <thead class="sticky-top bg-white">
                                    <tr>
                                        <th data-field="code">code</th>
                                        <th data-field="libelle">Libellé</th>
                                        <th data-field="niveau">Niveau</th>
                                        <th data-field="status" hidden>statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            break;
        case "StructPlanCompt":
            formHTML = `
                    <div class="row">
                        <div class="col-md-12 table-responsive" style="max-height: 70vh; overflow-y: auto;">
                            <table class="table-bordered table-hover table-sm tabList" id="tab_${IDButton}" width="100%" tabindex="0">
                                <thead class="sticky-top bg-white">
                                    <tr>
                                        <th data-field="code">code</th>
                                        <th data-field="libelle">Libellé</th>
                                        <th data-field="niveau">Niveau</th>
                                        <th data-field="collectif">Compte Collectif</th>
                                        <th data-field="gestionImmo">Compte Suivi en Immobilisation</th>
                                        <th data-field="budget">Budget</th>
                                        <th data-field="acti">Analyt.</th>
                                        <th data-field="geo">Géo.</th>
                                        <th data-field="fin">Finance</th>
                                        <th data-field="plan6" id="thChapitre" style="visiblity:hidden">Chapitre</th>
                                        <th data-field="status">Status</th>
                                        <th data-field="superClasse" hidden>superClasse</th>
                                        <th data-field="NOIMPUTJLTRESOR" hidden>NOIMPUTJLTRESOR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            break;
        case "StructCorrespondPlan":
            formHTML = `
                    <div class="row">
                        <div class="col-md-12">
                            <table style="position: sticky;top: 0;z-index: 1;" class="table-bordered tabList" id="tab_${IDButton}" width="100%" tabindex="0">
                                <thead class="sticky-top bg-white">
                                    <tr>
                                        <th data-field="cle" hidden>numEnreg</th>
                                        <th data-field="code">code</th>
                                        <th data-field="libelle">Correspond à</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            break;
        case "StructSousCategorie":
            formHTML = `
                    <div class="row">
                        <div class="col-md-12">
                            <table style="position: sticky;top: 0;z-index: 1;" class="table-bordered tabList" id="tab_${IDButton}" width="100%" tabindex="0">
                                <thead class="sticky-top bg-white">
                                    <tr>
                                        <th data-field="convention" hidden>convention</th>
                                        <th data-field="categorie" hidden>categorie</th>
                                        <th data-field="code">Code Sous-Catégorie</th>
                                        <th data-field="libelle">Libelle</th>
                                        <th data-field="status" hidden>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            break;
        case "StructPlanJournaux":
            formHTML = `
                    <div class="row">
                        <div class="col-md-12" style="max-height: 200px; overflow-y: auto">
                            <table class="table-bordered tabList" id="tab_${IDButton}" width="100%" tabindex="0">
                                <thead class="sticky-top bg-white">
                                    <tr>
                                        <th data-field="code1">Code</th>
                                        <th data-field="code2">Libellé</th>
                                        <th data-field="code3">Journal de Trésor</th>
                                        <th data-field="code4">Compte</th>
                                        <th data-field="code5">Journal</th>
                                        <th data-field="code6">Code</th>
                                        <th data-field="code7">Exclu</th>
                                        <th data-field="code8">Incrémentation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            break;
        case "StructBailleurFond":
            formHTML = `
                    <div class="row">
                        <div class="col-md-12" style="max-height: 200px; overflow-y: auto">
                            <table class="table-bordered tabList" id="tab_${IDButton}" width="100%" tabindex="0">
                                <thead class="sticky-top bg-white">
                                    <tr>
                                        <th data-field="code1">Code</th>
                                        <th data-field="code2">Libellé</th>
                                        <th data-field="code3">1 ère ligne d'adresse</th>
                                        <th data-field="code4">2 ème ligne d'adresse</th>
                                        <th data-field="code5">Ville</th>
                                        <th data-field="code6">Pays</th>
                                        <th data-field="code7">Téléphone</th>
                                        <th data-field="code8">Fax</th>
                                        <th data-field="code9">Adresse électronique</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            break;
        case "StructConventions":
            formHTML = `
                    <div class="row">
                        <div class="col-md-12" style="max-height: 200px; overflow-y: auto">
                            <table class="table-bordered tabList" id="tab_${IDButton}" width="100%" tabindex="0">
                                <thead class="sticky-top bg-white">
                                    <tr>
                                        <th data-field="code1">Code</th>
                                        <th data-field="code2">Libellé</th>
                                        <th data-field="code3">Emission mémoire</th>
                                        <th data-field="code4">Suivi (1ère)</th>
                                        <th data-field="code5">Suivi (2ème)</th>
                                        <th data-field="code6">Commentaire</th>
                                        <th data-field="code7">Signataire</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            break;
        case "StructSignataires":
            formHTML = `
                    <div class="row">
                        <div class="col-md-12" style="max-height: 200px; overflow-y: auto">
                            <table class="table-bordered tabList" id="tab_${IDButton}" width="100%" tabindex="0">
                                <thead class="sticky-top bg-white">
                                    <tr>
                                        <th data-field="code1">Code</th>
                                        <th data-field="code2">Libellé</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            break;
        case "StructVentilation":
            formHTML = `
                    <div class="row">
                        <div class="col-md-12 table-responsive" style="max-height: 70vh; overflow-y: auto;">
                            <table class="table-bordered table-hover table-sm tabList" id="tab_${IDButton}" width="100%" tabindex="0">
                                <thead class="sticky-top bg-white">
                                    <tr>
                                        <th data-field="code1">Convention</th>
                                        <th data-field="code2">1ère catégorie</th>
                                        <th data-field="code3">Taux - Locale</th>
                                        <th data-field="code4">Taux - Devise</th>
                                        <th data-field="code5">2ème catégorie</th>
                                        <th data-field="code6">Taux - Locale</th>
                                        <th data-field="code7">Taux - Devise</th>
                                        <th data-field="code8">3ème catégorie</th>
                                        <th data-field="code9">Taux - Locale</th>
                                        <th data-field="code10">Taux - Devise</th>
                                        <th data-field="code11">4ème catégorie</th>
                                        <th data-field="code12">Taux - Locale</th>
                                        <th data-field="code13">Taux - Devise</th>
                                        <th data-field="code14">5ème catégorie</th>
                                        <th data-field="code15">Taux - Locale</th>
                                        <th data-field="code16">Taux - Devise</th>
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
function vueFirstNiveau() {
    let container = document.getElementById('divLastniveau');
    container.innerHTML = "";
    let formHTML = "";
    switch (IDButton) {
        case "StructPlanCompt":
            formHTML = `
                        <hr />
                        <div class="row">
                            <div class="col-md-12">
                                <h5 style="color:#ff6a00"><u>Super Classe</u></h5>
                            </div>
                        </div>
                        <div class="row" style="padding-top:12px">
                            <div class="col-md-4">
                                <label for="superClass">Super-Classe de Rattachement</label>
                            </div>
                            <div class="col-md-8">
                                <select id="superClass" class="choixSelect input_focus disabled_me" style="width:100%">
                                </select>
                                <span class="erreur"></span>
                            </div>
                        </div>
                        `;
            container.insertAdjacentHTML("beforeend", formHTML);
            break;
        default:
            container.insertAdjacentHTML("beforeend", "");
            break;
    }
    if ($('#superClass').length > 0) {
        $('#superClass').select2();
        $.ajax({
            async: true,
            type: 'GET',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8',
            data: { id: IDButton },
            url: '/FINPRO_Codifications/GetListDataStruct',
            success: function (data) {
                const $select = $('#superClass');
                let list = data.listSuperClass;
                $.each(list, function (index, row) {
                    $select.append("<option value='" + row.code + "'>" + row.code + " " + row.libelle + "</option>");
                });
            }
        });
    }
    //controleInput();
}
function vueLastNiveau() {
    let container = document.getElementById('divLastniveau');
    container.innerHTML = "";
    let formHTML = "";
    switch (IDButton) {
        case "StructPlanBudget":
        case "StructActivite":
        case "StructZone":
        case "StructEmplacements":
        case "StructPlan6":
        case "StructPlanExtP1":
        case "StructPlanExtP2":
        case "StructPlanExtP3":
        case "StructPlanExtP4":
            formHTML = `
                            <div class="row">
                                <div class="col-md-2">
                                </div>
                                <div class="col-md-3">
                                    <div class="form-check">
                                        <input class="form-check-input disabled_me" id="checkActif" type="checkbox" value="" style="cursor:pointer"/>
                                        <label class="form-check-label" style="cursor:pointer" for="checkActif"><strong>Actif</strong></label>
                                    </div>
                                </div>
                            </div>
                        `;
            break;
        case "StructPlanCompt":
            formHTML = `
                        <div id="formLast">
                            <div class="row">
                                <div class="col-md-12">
                                    <ul class="nav nav-underline fs-9" id="myTab" role="tablist">
                                        <li class="nav-item" role="presentation"><a class="nav-link active" id="Caracteristiques-tab" data-bs-toggle="tab" href="#tab-Caracteristiques" role="tab" aria-controls="tab-Caracteristiques" aria-selected="true">Caractéristiques</a></li>
                                        <li class="nav-item" role="presentation"><a class="nav-link" id="ActiviteRatt-tab" data-bs-toggle="tab" href="#tab-ActiviteRatt" role="tab" aria-controls="tab-ActiviteRatt" aria-selected="false" tabindex="-1">Activité Ratt.</a></li>
                                        <li class="nav-item" role="presentation"><a class="nav-link" id="BudgetRatt-tab" data-bs-toggle="tab" href="#tab-BudgetRatt" role="tab" aria-controls="tab-BudgetRatt" aria-selected="false" tabindex="-1">Budget Ratt.</a></li>
                                        <li class="nav-item" role="presentation"><a class="nav-link" id="ComportDefaut-tab" data-bs-toggle="tab" href="#tab-ComportDefaut" role="tab" aria-controls="tab-ComportDefaut" aria-selected="false" tabindex="-1">Comport. Défaut</a></li>
                                    </ul>
                                    <div class="tab-content mt-3" id="myTab1Content">
                                        <div class="tab-pane fade active show" id="tab-Caracteristiques" role="tabpanel" aria-labelledby="Caracteristiques-tab">
                                            <div class="row" style="padding-bottom:10px">
                                                <div class="col-md-12">
                                                    <div class="row">
                                                        <div class="col-md-6" style="border-right:1px solid #c7c3c3">
                                                            <div class="form-check">
                                                                <input class="form-check-input cursorPointer disabledBtnPl" type="checkbox" value="" id="checkCpteCollectif">
                                                                <label class="form-check-label cursorPointer" for="checkCpteCollectif">
                                                                    Compte Collectif Tiers
                                                                </label>
                                                            </div>
                                                            <div class="form-check">
                                                                <input class="form-check-input cursorPointer disabledBtnPl" type="checkbox" value="" id="checkCpteSuivi">
                                                                <label class="form-check-label cursorPointer" for="checkCpteSuivi">
                                                                    Compte Suivi en Immobilisation
                                                                </label>
                                                            </div>
                                                            <div class="form-check">
                                                                <input class="form-check-input cursorPointer disabledBtnPl" type="checkbox" value="" id="checkActif">
                                                                <label class="form-check-label cursorPointer" for="checkActif">
                                                                    Actif
                                                                </label>
                                                            </div>
                                                            <div class="form-check">
                                                                <input class="form-check-input cursorPointer disabledBtnPl" type="checkbox" value="" id="checkImputation">
                                                                <label class="form-check-label cursorPointer" for="checkImputation">
                                                                    Pas d'imputation/JL Trésor
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <!-- Groupe des checkbox concernées -->
                                                            <div style="display: flex; gap: 10px; margin-top: 10px;">
                                                                <div style="display: flex; flex-direction: column; align-items: center;">
                                                                    <div style="background-color: #fbe5b6; padding: 4px 8px;">Budget</div>
                                                                    <input type="checkbox" value="Budget" id="checkBudget" class="groupe-check disabledBtnPl cursorPointer">
                                                                </div>
                                                                <div style="display: flex; flex-direction: column; align-items: center;">
                                                                    <div style="background-color: #fbe5b6; padding: 4px 8px;">Analyt.</div>
                                                                    <input type="checkbox" value="Analyt" id="checkAnalyt" class="groupe-check disabledBtnPl cursorPointer">
                                                                </div>
                                                                <div style="display: flex; flex-direction: column; align-items: center;">
                                                                    <div style="background-color: #fbe5b6; padding: 4px 8px;">Géo.</div>
                                                                    <input type="checkbox" value="Geo" id="checkGeo" class="groupe-check disabledBtnPl cursorPointer">
                                                                </div>
                                                                <div style="display: flex; flex-direction: column; align-items: center;">
                                                                    <div style="background-color: #fbe5b6; padding: 4px 8px;">Financ.</div>
                                                                    <input type="checkbox" value="Financ" id="checkFinanc" class="groupe-check disabledBtnPl cursorPointer">
                                                                </div>
                                                                <div style="display: flex; flex-direction: column; align-items: center;visibility:hidden" id="niveauChap">
                                                                    <div style="background-color: #fbe5b6; padding: 4px 8px;">Chapit.</div>
                                                                    <input type="checkbox" value="Chapit" id="checkPlan6" class="groupe-check disabledBtnPl cursorPointer">
                                                                </div>
                                                            </div>

                                                            <div class="row justify-content-center" style="text-align:center">
                                                                <div class="col-md-12">
                                                                    <button style="margin-top:10px" id="btnToggle" class="btn_action disabledBtnPl" onclick="toggleCheckboxes()">Cocher Tout</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="tab-pane fade" id="tab-ActiviteRatt" role="tabpanel" aria-labelledby="ActiviteRatt-tab">
                                            <div class="row" style="padding-bottom:10px">
                                                <div class="col-md-12">
                                                    <div class="row">
                                                        <div class="col-md-12">
                                                            <table class="tabList" style="width:100%" id="tabAffect_ActiviteRatt">
                                                                <thead>
                                                                    <tr>
                                                                        <th style="text-align:center;width:4%" class="white-space-nowrap fs-9 align-middle ps-0" style="max-width:20px; width:18px;">
                                                                            <div class="form-check mb-0 fs-8">
                                                                                <input class="form-check-input" id="bulk-select-example" type="checkbox">
                                                                            </div>
                                                                        </th>
                                                                        <th style="text-align:center;width:10%">Code</th>
                                                                        <th style="text-align:center">Libellé</th>
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
                                        <div class="tab-pane fade" id="tab-BudgetRatt" role="tabpanel" aria-labelledby="BudgetRatt-tab">
                                            <div class="row" style="padding-bottom:10px">
                                                <div class="col-md-12">
                                                    <div class="row">
                                                        <div class="col-md-12">
                                                            <table class="tabList" style="width:100%" id="tabAffect_BudgetRatt">
                                                                <thead>
                                                                    <tr>
                                                                        <th style="text-align:center;width:4%" class="white-space-nowrap fs-9 align-middle ps-0" style="max-width:20px; width:18px;">
                                                                            <div class="form-check mb-0 fs-8">
                                                                                <input class="form-check-input" id="bulk-select-example" type="checkbox">
                                                                            </div>
                                                                        </th>
                                                                        <th style="text-align:center;width:10%">Code</th>
                                                                        <th style="text-align:center">Libellé</th>
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
                                        <div class="tab-pane fade" id="tab-ComportDefaut" role="tabpanel" aria-labelledby="ComportDefaut-tab">
                                            <div class="row" style="padding-bottom:10px">
                                                <div class="col-md-12">
                                                    <div class="row">
                                                        <div class="col-md-4">
                                                            <label for="journalOD">Journaux de type O.D.</label>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <select id="journalOD" class="input_focus choixSelect comportement disabledBtnPl" style="width:100%">
                                                                <option value="0"></option>
                                                                <option value="D">Débit</option>
                                                                <option value="C">Crédit</option>
                                                            </select>
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-4">
                                                            <label for="journalTresor">Journaux de Trésorerie</label>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <select id="journalTresor" class="input_focus choixSelect comportement disabledBtnPl" style="width:100%">
                                                                <option value="0"></option>
                                                                <option value="D">Débit</option>
                                                                <option value="C">Crédit</option>
                                                            </select>
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-4">
                                                            <label for="ComportementOblig">Comportement Obligatoire</label>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <select id="ComportementOblig" class="input_focus choixSelect comportement disabledBtnPl" style="width:100%">
                                                                <option value="0"></option>
                                                                <option value="D">Débiteur</option>
                                                                <option value="C">Créditeur</option>
                                                            </select>
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-4">
                                                            <label for="compteLett">Compte Lettrable</label>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <select id="compteLett" class="input_focus choixSelect comportement disabledBtnPl" style="width:100%">
                                                                <option value="N">Non</option>
                                                                <option value="O">Oui</option>
                                                            </select>
                                                            <span class="erreur"></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
            break;
    }
    container.insertAdjacentHTML("beforeend", formHTML);
    
}
function isElementVisible(el) {
    if (!el) return false;

    const style = window.getComputedStyle(el);
    const isDisplayed = style.display !== "none";
    const isVisible = style.visibility !== "hidden";
    const isOpacityVisible = parseFloat(style.opacity) > 0;
    const isInDocument = el.offsetParent !== null;
    //return isDisplayed && isVisible && isOpacityVisible && isInDocument;
    return isDisplayed && isVisible && isOpacityVisible;
}
function isVisible(elem) {
    return !!(elem && elem.offsetParent !== null && getComputedStyle(elem).visibility !== 'hidden' && getComputedStyle(elem).display !== 'none');
}
function controleInput() {
    $("#closeSt").click(function () {
        document.getElementById('fullscreen_popup').style.display = "none";
    })
    $('#Choixniveau').on('change', function () {

        let selectedIndex = this.selectedIndex;
        let total = this.options.length;
        const select = this;

        let nameAttr = "";
        if (selectedIndex > 0) {
            // Récupérer le name de l'option précédente
            const previousOption = select.options[selectedIndex - 1];
            nameAttr = previousOption.getAttribute("name");
        }

        if (selectedIndex === total - 1) { //Dernière option sélectionnée.
            vueLastNiveau();
            document.getElementById('label_next_niveau').textContent = nameAttr;
            $('#divTo_niveau').show();
            $(this).attr('data-position', 'last');

        } else if (selectedIndex === 0) { //Première option sélectionnée.
            vueFirstNiveau();
            $('#divTo_niveau').hide();
            document.getElementById('label_next_niveau').textContent = "";
            $(this).attr('data-position', 'first');

        } else { //Option du milieu sélectionnée.
            $('#divTo_niveau').show();
            document.getElementById('label_next_niveau').textContent = nameAttr;
            document.getElementById('divLastniveau').innerHTML = "";
            $(this).removeAttr('data-position');
        }
        if (this.id == "Choixniveau") {
            $("#next_niveau").val(null);
        }

        var niveau1 = $(this).val();
        var niveau2 = $("#next_niveau").val();
        GetDataniveau2(niveau1, niveau2);

        if ($('#divLastniveau').length > 0 && $('#formLast').length > 0) {
            GetListLastNiveauAct_Budget();
            initializeCheckboxListeners();
            switch (IDButton) {
                case "StructPlanCompt":
                    const btnText = document.getElementById("StructPlan6");
                    if (btnText) {
                        const text = btnText.textContent.trim();

                        if (text) {
                            if (isElementVisible(btnText)) {
                                document.getElementById('niveauChap').style.visibility = "visible";
                                //console.log("✅ Le bouton #plan6 contient du texte visible :", text);
                            } else {
                                document.getElementById('niveauChap').style.visibility = "hidden";
                                //console.log("⚠️ Le bouton #plan6 contient du texte mais il n'est pas visible.");
                            }
                        } else {
                            document.getElementById('niveauChap').style.visibility = "hidden";
                            //console.log("❌ Le bouton #plan6 ne contient pas de texte.");
                        }
                    } else {
                        document.getElementById('niveauChap').style.visibility = "hidden";
                        //console.log("❌ Le bouton #plan6 n'existe pas dans le DOM.");
                    }
                    break;
            }
        }
        switch (IDButton) {
            case "StructPlanCompt":
                const btnText = document.getElementById("StructPlan6");
                if (btnText) {
                    const text = btnText.textContent.trim();
                    if (text) {
                        if (isElementVisible(btnText)) {
                            setColumnVisibilityWithDataTable("tab_" + IDButton, 9, true);
                            //console.log("✅ Le bouton #plan6 contient du texte visible :", text);
                        } else {
                            setColumnVisibilityWithDataTable("tab_" + IDButton, 9, false);
                            //console.log("⚠️ Le bouton #plan6 contient du texte mais il n'est pas visible.");
                        }
                    } else {
                        setColumnVisibilityWithDataTable("tab_" + IDButton, 9, false);
                        //console.log("❌ Le bouton #plan6 ne contient pas de texte.");
                    }
                } else {
                    setColumnVisibilityWithDataTable("tab_" + IDButton, 9, false);
                    //console.log("❌ Le bouton #plan6 n'existe pas dans le DOM.");
                }
                break;
        }
    });
    $("#next_niveau").change(function () {
        var niveau1 = $("#Choixniveau").val();
        var niveau2 = $(this).val();
        GetDataniveau2(niveau1, niveau2);
    })
    $("#codeConvention").change(function () {
        var idCode = this.id;
        if (idCode == "codeConvention") {
            $("#codeCategorie").val(null);
        }
        var niveau1 = $(this).val();
        var niveau2 = $("#codeCategorie").val();
        GetDataniveau2(niveau1, niveau2);
    })
    $("#codeCategorie").change(function () {
        var niveau1 = $("#codeConvention").val();
        var niveau2 = $(this).val();
        GetDataniveau2(niveau1, niveau2);
    })
    $("#codeSousCat").keyup(function () {
        this.value = this.value.toUpperCase();
    })
    document.querySelectorAll(".PlCorrespond").forEach(button => {
        button.addEventListener("click", function () {
            IDbuttonCorresp = this.id;
            GetDataCorrespondance();
        });
    });


    if ($('#divTo_niveau').length > 0 && $('#next_niveau').length > 0) {
        $('.choixSelect').select2();
    }
    $("#tab_" + IDButton + " tbody").on("click", "tr", function () {
        if (isEditing) return; // Désactiver si en mode édition
        const wasAlreadySelected = $(this).hasClass("selected");

        if (!wasAlreadySelected) {
            $("#tab_" + IDButton + " tbody tr").removeClass("selected");
            $(this).addClass("selected");
            chargerValeursDepuisLigne(this, IDButton);
        }
        // sinon : ne rien faire, garder la sélection
    });
    $('.input_focus').keyup(function () {
        $(this).siblings('span.erreur').hide();
    })
    $('.choixSelect').select2();

}
function setColumnVisibilityWithDataTable(tableId, colIndex, visible) {
    const table = $('#' + tableId).DataTable();
    table.column(colIndex).visible(visible);
}

// Fonction pour masquer ou afficher la colonne 8 (index 8) du tableau #tabPlan
function setColumnVisibility(tableId, colIndex, visible) {
    const table = document.getElementById(tableId);
    if (!table) return;

    // Masquer ou afficher les <th>
    const ths = table.querySelectorAll("thead th");
    if (ths[colIndex]) {
        ths[colIndex].style.display = visible ? "" : "none";
    }

    // Masquer ou afficher les <td> du tbody
    const rows = table.querySelectorAll("tbody tr");
    rows.forEach(row => {
        const cells = row.cells;
        if (cells[colIndex]) {
            cells[colIndex].style.display = visible ? "" : "none";
        }
    });
}

function chargerValeursDepuisLigne(row, IDButton) {
    var code = null, libelle = null, etatActif = null;
    switch (IDButton) {
        case "StructPlanBudget":
        case "StructActivite":
        case "StructZone":
        case "StructEmplacements":
        case "StructPlan6":
        case "StructPlanExtP1":
        case "StructPlanExtP2":
        case "StructPlanExtP3":
        case "StructPlanExtP4":
            code = row.cells[0].innerHTML;
            libelle = row.cells[1].innerHTML;
            $("#code").val(code);
            $("#libelle").val(libelle);
            etatActif = row.cells[3].innerHTML;
            if ($('#divLastniveau').children().length > 0) {
                document.getElementById('checkActif').checked = false;
                const $checkbox = $("#checkActif");
                $checkbox.prop("checked", etatActif === "1" || etatActif.toLowerCase() === "true");
            }
            break;

        case "StructPlanCompt":
            code = row.cells[0].innerHTML;
            libelle = row.cells[1].innerHTML;
            $("#code").val(code);
            $("#libelle").val(libelle);
            if ($('#superClass').length > 0) {
                var superClass = null;
                const btnText = document.getElementById("StructPlan6");
                if (btnText) {
                    const text = btnText.textContent.trim();

                    if (text) {
                        if (isElementVisible(btnText)) {
                            superClass = row.cells[11].innerHTML;
                            //console.log("✅ Le bouton #plan6 contient du texte visible :", text);
                        } else {
                            superClass = row.cells[10].innerHTML;
                            //console.log("⚠️ Le bouton #plan6 contient du texte mais il n'est pas visible.");
                        }
                    } else {
                        superClass = row.cells[10].innerHTML;
                        //console.log("❌ Le bouton #plan6 ne contient pas de texte.");
                    }
                } else {
                    superClass = row.cells[10].innerHTML;
                    //console.log("❌ Le bouton #plan6 n'existe pas dans le DOM.");
                }
                $("#superClass").val(superClass).trigger('change');
            }
            if ($("#formLast").children().length > 0) {
                $(".disabledBtnPl").prop("disabled", true);
                const checkCollectif = row.cells[3].querySelector("input[type='checkbox']");
                const checkSuivi = row.cells[4].querySelector("input[type='checkbox']");
                const checkActif = row.cells[9].querySelector("input[type='checkbox']");
                var checkPlan6 = null, checkImputation = null;

                if (checkCollectif && checkCollectif.checked) {
                    $("#checkCpteCollectif").prop("checked", true);
                } else {
                    $("#checkCpteCollectif").prop("checked", false);
                }
                if (checkSuivi && checkSuivi.checked) {
                    $("#checkCpteSuivi").prop("checked", true);
                } else {
                    $("#checkCpteSuivi").prop("checked", false);
                }
                if (checkActif && checkActif.checked) {
                    $("#checkActif").prop("checked", true);
                } else {
                    $("#checkActif").prop("checked", false);
                }
                const btnText = document.getElementById("StructPlan6");
                if (btnText) {
                    const text = btnText.textContent.trim();
                    if (text) {
                        if (isElementVisible(btnText)) {
                            checkPlan6 = row.cells[9].querySelector("input[type='checkbox']");
                            checkImputation = row.cells[12].querySelector("input[type='checkbox']");

                            if (checkPlan6 && checkPlan6.checked) {
                                $("#checkPlan6").prop("checked", true);
                            } else {
                                $("#checkPlan6").prop("checked", false);
                            }
                            if (checkImputation && checkImputation.checked) {
                                $("#checkImputation").prop("checked", true);
                            } else {
                                $("#checkImputation").prop("checked", false);
                            }
                            //console.log("✅ Le bouton #plan6 contient du texte visible :", text);
                        } else {
                            checkImputation = row.cells[11].querySelector("input[type='checkbox']");
                            if (checkImputation && checkImputation.checked) {
                                $("#checkImputation").prop("checked", true);
                            } else {
                                $("#checkImputation").prop("checked", false);
                            }
                            //console.log("⚠️ Le bouton #plan6 contient du texte mais il n'est pas visible.");
                        }
                    } else {
                        checkImputation = row.cells[11].querySelector("input[type='checkbox']");
                        if (checkImputation && checkImputation.checked) {
                            $("#checkImputation").prop("checked", true);
                        } else {
                            $("#checkImputation").prop("checked", false);
                        }
                        //console.log("❌ Le bouton #plan6 ne contient pas de texte.");
                    }
                } else {
                    checkImputation = row.cells[11].querySelector("input[type='checkbox']");
                    if (checkImputation && checkImputation.checked) {
                        $("#checkImputation").prop("checked", true);
                    } else {
                        $("#checkImputation").prop("checked", false);
                    }
                    //console.log("❌ Le bouton #plan6 n'existe pas dans le DOM.");
                }
                const checkBudget = row.cells[5].querySelector("input[type='checkbox']");
                const checkAnalyt = row.cells[6].querySelector("input[type='checkbox']");
                const checkGeo = row.cells[7].querySelector("input[type='checkbox']");
                const checkFinance = row.cells[8].querySelector("input[type='checkbox']");

                if (checkBudget && checkBudget.checked) {
                    $("#checkBudget").prop("checked", true);
                } else {
                    $("#checkBudget").prop("checked", false);
                }
                if (checkAnalyt && checkAnalyt.checked) {
                    $("#checkAnalyt").prop("checked", true);
                } else {
                    $("#checkAnalyt").prop("checked", false);
                }
                if (checkGeo && checkGeo.checked) {
                    $("#checkGeo").prop("checked", true);
                } else {
                    $("#checkGeo").prop("checked", false);
                }
                if (checkFinance && checkFinance.checked) {
                    $("#checkFinanc").prop("checked", true);
                } else {
                    $("#checkFinanc").prop("checked", false);
                }
                updateToggleButtonText();
            }
            break;
        case "StructCorrespondPlan":
            numEnregCores = row.cells[0].innerHTML;
            $("#code").val(row.cells[1].innerHTML).trigger('change');
            $("#correspondance").val(row.cells[2].innerHTML).trigger('change');
            break;
        case "StructSousCategorie":
            $("#codeSousCat").val(row.cells[2].innerHTML);
            $("#libelle").val(row.cells[3].innerHTML);
            etatActif = row.cells[4].innerHTML;
            if (etatActif == "True") {
                document.getElementById('checkActif').checked = true;
            } else {
                document.getElementById('checkActif').checked = false;
            }
            break;
    }
}

function updateToggleButtonText() {
    const checkboxes = document.querySelectorAll(".groupe-check");
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    document.getElementById("btnToggle").textContent = allChecked ? "Décocher Tout" : "Cocher Tout";

    // Gestion dynamique des boutons liés à des cases spécifiques
    const boutonsParValeur = {
        Analyt: ["btnAnalyt1", "btnAnalyt2"],  //Analyt value du checkbox
        Budget: ["btnBudget1", "btnBudget2"]
        // Tu peux ajouter ici d'autres couples si besoin
    };

    for (const [valeur, boutons] of Object.entries(boutonsParValeur)) {
        const cb = Array.from(checkboxes).find(cb => cb.value === valeur);
        const isChecked = cb && cb.checked;

        boutons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = !isChecked;
        });
    }
}


function toggleCheckboxes() {
    const checkboxes = document.querySelectorAll(".groupe-check");
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => cb.checked = !allChecked);
    updateToggleButtonText();
}

function initializeCheckboxListeners() {
    const checkboxes = document.querySelectorAll(".groupe-check");
    checkboxes.forEach(cb => {
        cb.addEventListener("change", updateToggleButtonText);
    });
    updateToggleButtonText(); // mise à jour initiale

    if ($('.comportement').length > 0) {
        $('.comportement').select2();
    }
}
function GetListLastNiveauAct_Budget() {
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        url: '/FINPRO_Codifications/GetListLastNiveauAct_Budget',
        success: function (data) {
            // Remplir les deux tableaux avec une fonction réutilisable
            renderTable('#tabAffect_ActiviteRatt', data.listAct);
            renderTable('#tabAffect_BudgetRatt', data.listBudget);

        }
    });
}

// Fonction réutilisable pour construire et initialiser un tableau DataTable
function renderTable(tableId, dataList) {
    if (!Array.isArray(dataList)) return;

    const $table = $(tableId);

    // Détruire et nettoyer l'ancien DataTable
    if ($.fn.DataTable.isDataTable(tableId)) {
        $table.DataTable().destroy();
    }
    $(`${tableId} tbody`).empty();

    // Construire les lignes HTML
    const rows = dataList.map(item => {
        const isChecked = item.status === "1" ? "checked" : "";
        return `<tr>
            <td style="text-align:center" class="fs-9 align-middle">
                <div class="form-check mb-0 fs-8">
                    <input ${isChecked} class="form-check-input" type="checkbox">
                </div>
            </td>
            <td>${item.code}</td>
            <td>${tronquer(item.libelle || "", 50)}</td>
        </tr>`;
    });

    // Injecter toutes les lignes d'un coup (meilleure performance)
    $(`${tableId} tbody`).html(rows.join(""));

    // Initialiser DataTable
    $table.DataTable({
        pageLength: 10,
        lengthMenu: [[10, 50, 100, 150, 200, -1], [10, 50, 100, 150, 200, "Tous"]],
        responsive: true,
        lengthChange: true,
        scrollCollapse: true,
        paging: false,
        ordering: false,
        //autoWidth: false,        // 🚫 Important pour éviter <colgroup>
        scrollY: '150px',          // 🚫 Enlever scrollY désactive aussi colgroup
        scrollX: false,          // 🚫 Idem
        initComplete: function () {
            $table.removeClass('dataTable');

            // Supprimer manuellement <colgroup> si généré
            $table.find("colgroup").remove();
        },
        language: {
            lengthMenu: "Afficher _MENU_ entrées",
            emptyTable: "Aucun élément trouvé",
            info: "Affichage _START_ à _END_ de _TOTAL_ entrées",
            loadingRecords: "Chargement...",
            processing: "En cours...",
            search: '<i class="fa fa-search" aria-hidden="true"></i>',
            searchPlaceholder: "Rechercher...",
            zeroRecords: "Aucun élément correspondant trouvé",
            paginate: {
                first: "Premier",
                last: "Dernier",
                next: "Suivant",
                previous: "Précédent"
            }
        }
    });


    // Activer les tooltips
    //$('[data-toggle="tooltip"]').tooltip();

}

function tronquer(text, maxLength) {
    if (!text) return "";
    if (text.length <= maxLength) {
        return text; // Si le texte est court, on l'affiche normalement
    } else {
        const truncated = text.substring(0, maxLength) + "...";
        // On retourne du HTML : texte coupé avec l'original dans l'attribut title pour le survol
        return `<span title="${text}" data-toggle="tooltip" data-placement="top">${truncated}</span>`;
    }
}
function DataNiveau() {
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: { id: IDButton },
        url: '/FINPRO_Codifications/GetListDataStruct',
        success: function (data) {
            var $select = null, list = null;
            switch (IDButton) {
                case "StructCorrespondPlan":
                case "StructPlanTier":
                case "StructPlanJournaux":
                case "StructBailleurFond":
                case "StructConventions":
                case "StructSignataires":
                case "StructVentilation":
                case "StructCategorieFinance":

                    break;
                case "StructPlanBudget":
                case "StructActivite":
                case "StructZone":
                case "StructEmplacements":
                case "StructPlan6":
                case "StructPlanExtP1":
                case "StructPlanExtP2":
                case "StructPlanExtP3":
                case "StructPlanExtP4":
                    $select = $('#Choixniveau');
                    $select.empty();
                    list = data.listData;
                    if (list.length === 0) {
                        $(".btn_action").prop("disabled", true);
                        document.getElementById('closeSt').disabled = false;
                        $('#divTo_niveau').hide();
                        return;
                    }

                    if (!list || list.length === 0) return;

                    $.each(list, function (index, row) {
                        $select.append("<option value='" + row.niveau + "' data-format='" + row.format + "' name='" + row.abreviation + "'>" + row.niveau + " " + row.libelle + "</option>");
                    });

                    if (list.length === 1) { //Une seule option : considérée comme dernière.");
                        vueLastNiveau();
                        
                        $('#divTo_niveau').hide();
                        $select.attr('data-position', 'last');
                    } else {  // Première option sélectionnée par défaut.");
                        vueFirstNiveau();
                        $select.attr('data-position', 'first');
                    }

                    var niveau1 = $("#Choixniveau").val();
                    var niveau2 = $("#next_niveau").val();
                    GetDataniveau2(niveau1, niveau2);
                    break;
                case "StructSousCategorie":
                    $select = $('#codeConvention');
                    $select.empty();
                    list = data.listData;
                    if (!list || list.length === 0) {
                        $(".btn_action").prop("disabled", true);
                        document.getElementById('closeSt').disabled = false;
                        return;
                    }

                    $.each(list, function (index, row) {
                        $select.append("<option value='" + row.code + "'>" + row.code + " " + row.libelle + "</option>");
                    });

                    var niveau1 = $("#codeConvention").val();
                    var niveau2 = $("#codeCategorie").val();
                    GetDataniveau2(niveau1, niveau2);
                    break;
                case "StructPlanCompt":
                    $select = $('#Choixniveau');
                    //$select.empty();
                    list = data.listData;
                    if (list.length === 0) {
                        $(".btn_action").prop("disabled", true);
                        document.getElementById('closeSt').disabled = false;
                        $('#divTo_niveau').hide();
                        return;
                    }

                    if (!list || list.length === 0) return;

                    $.each(list, function (index, row) {
                        $select.append("<option value='" + row.niveau + "' data-format='" + row.format + "' name='" + row.abreviation + "'>" + row.niveau + " " + row.libelle + "</option>");
                    });

                    if (list.length === 1) { //Une seule option : considérée comme dernière.");
                        vueLastNiveau();
                        //Pour le dernier 
                        //GetListLastNiveauAct_Budget();
                        $('#divTo_niveau').hide();
                        $select.attr('data-position', 'last');
                    } else {  // Première option sélectionnée par défaut.");
                        vueFirstNiveau();
                        $select.attr('data-position', 'first');
                    }

                    var niveau1 = $("#Choixniveau").val();
                    var niveau2 = $("#next_niveau").val();
                    GetDataniveau2(niveau1, niveau2);
                    if ($('#divLastniveau').length > 0 && $('#superClass').length > 0) {
                        const $selectCl = $('#superClass');
                        $selectCl.empty();
                        let listCl = data.listSuperClass;
                        $.each(listCl, function (index, row) {
                            $selectCl.append("<option value='" + row.code + "'>" + row.code + " " + row.libelle + "</option>");
                        });
                    }
                    break;
            }
        }
    });
    $('.input_focus').siblings('span.erreur').hide();
}
function GetDataniveau2(niveau1, niveau2) {
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: {
            niveau: IDButton,
            code1: niveau1,
            code2: niveau2,
        },
        url: '/FINPRO_Codifications/GetListDataNiveau2',
        success: function (data) {
            var $select = null;
            let Dataniveau2 = data.listniveau;
            switch (IDButton) {
                case "StructPlanBudget":
                case "StructActivite":
                case "StructZone":
                case "StructEmplacements":
                case "StructPlan6":
                case "StructPlanCompt":
                case "StructPlanExtP1":
                case "StructPlanExtP2":
                case "StructPlanExtP2":
                case "StructPlanExtP4":
                    $select = $('#next_niveau');
                    if ($("#next_niveau").val() == "" || $("#next_niveau").val() == null) {
                        $select.empty();
                        //$("#next_niveau").append("<option value='0'></option>")
                        $.each(Dataniveau2, function (index, row) {
                            $select.append("<option value='" + row.code + "'>" + row.code + " " + row.libelle + "</option>");
                        });
                    }
                    break;
                case "StructSousCategorie":
                    $select = $('#codeCategorie');
                    if ($("#codeCategorie").val() == "" || $("#codeCategorie").val() == null) {
                        $select.empty();
                        $.each(Dataniveau2, function (index, row) {
                            $select.append("<option value='" + row.code + "'>" + row.code + " " + row.libelle + "</option>");
                        });
                    }
                    break;
            }
            LoadTable(IDButton, data.listData);
        }
    });
}
function LoadTable(niveau, data) {
    document.getElementById('Ajouter').disabled = false;

    document.getElementById('Ajouter').textContent = "Ajouter";
    document.getElementById('closeSt').disabled = false;
    document.getElementById('Annuler').disabled = true;
    if (data.length == 0) {
        isEditing = true;
        $("#tab_" + niveau + " tbody").empty();
        $("#Modifier, #Supprimer").prop("disabled", true);
        switch (IDButton) {
            case "StructPlanBudget":
            case "StructActivite":
            case "StructZone":
            case "StructEmplacements":
            case "StructPlan6":
            case "StructPlanCompt":
                $("#Imprimer,#Voir, #TXT, #excel, #Importation").prop("disabled", true);
                break;
            case "StructBailleurFond":
            case "StructConventions":
                $("#Imprimer,#Voir, #Fiche").prop("disabled", true);
                break;
            case "StructPlanExtP1":
            case "StructPlanExtP2":
            case "StructPlanExtP3":
            case "StructPlanExtP4":
            case "StructCorrespondPlan":
            case "StructPlanJournaux":
            case "StructCategorieFinance":
                $("#Imprimer,#Voir").prop("disabled", true);
                break;
            case "StructPlanTier":
                $("#Imprimer,#Voir,#Duplication,#Recherche,#Importation").prop("disabled", true);
                break;
            case "StructSousCategorie":
                $("#Imprimer,#Voir,#codeConvention,#codeCategorie").prop("disabled", true);
                break;
            case "StructVentilation":
            case "StructSignataires":
                $("#Liste").prop("disabled", true);
                break;
        }
        reset();
    }
    else {
        isEditing = false;
        updateTableWithData(niveau, data);
        const table = document.getElementById("tab_" + niveau);
        if (table.tBodies[0].rows.length > 0) {
            fillFirstRowForm(niveau, table.tBodies[0].rows[0]);
        }
        $("#Modifier, #Supprimer").prop("disabled", false);
        switch (IDButton) {
            case "StructPlanBudget":
            case "StructActivite":
            case "StructZone":
            case "StructEmplacements":
            case "StructPlan6":
            case "StructPlanCompt":
                $("#Imprimer,#Voir, #TXT, #excel, #Importation").prop("disabled", false);
                break;
            case "StructBailleurFond":
            case "StructConventions":
                $("#Imprimer,#Voir, #Fiche").prop("disabled", false);
                break;
            case "StructPlanExtP1":
            case "StructPlanExtP2":
            case "StructPlanExtP3":
            case "StructPlanExtP4":
            case "StructCorrespondPlan":
            case "StructPlanJournaux":
            case "StructCategorieFinance":
                $("#Imprimer,#Voir").prop("disabled", false);
                break;
            case "StructPlanTier":
                $("#Imprimer,#Voir,#Duplication,#Recherche,#Importation").prop("disabled", false);
                break;
            case "StructSousCategorie":
                $("#Imprimer,#Voir,#codeConvention,#codeCategorie").prop("disabled", false);
                break;
            case "StructVentilation":
            case "StructSignataires":
                $("#Liste").prop("disabled", false);
                break;
        }
        switch (IDButton) {
            case "StructPlanCompt":
                const btnText = document.getElementById("StructPlan6");
                if (btnText) {
                    const text = btnText.textContent.trim();
                    if (text) {
                        if (isElementVisible(btnText)) {
                            setColumnVisibilityWithDataTable("tab_" + IDButton, 9, true);
                            //console.log("✅ Le bouton #plan6 contient du texte visible :", text);
                        } else {
                            setColumnVisibilityWithDataTable("tab_" + IDButton, 9, false);
                            //console.log("⚠️ Le bouton #plan6 contient du texte mais il n'est pas visible.");
                        }
                    } else {
                        setColumnVisibilityWithDataTable("tab_" + IDButton, 9, false);
                        //console.log("❌ Le bouton #plan6 ne contient pas de texte.");
                    }
                } else {
                    setColumnVisibilityWithDataTable("tab_" + IDButton, 9, false);
                    //console.log("❌ Le bouton #plan6 n'existe pas dans le DOM.");
                }
                break;
        }
    }
    $(".disabled_me").prop("disabled", true);
}
function GetDataCorrespondance() {
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: {
            niveau: IDbuttonCorresp,
        },
        url: '/FINPRO_Codifications/GetListDataCorrespondance',
        success: function (data) {
            const $selectCode = $('#code');
            let dataCode = data.listCode;
            if (dataCode.length === 0) {
                $(".btn_action").prop("disabled", true);
                document.getElementById('closeSt').disabled = false;
                return;
            }
            $selectCode.empty();
            $selectCode.append("<option value='0'></option>")
            $.each(dataCode, function (index, row) {
                $selectCode.append("<option value='" + row.code + "'>" + row.code + " " + row.libelle + "</option>");
            });
            const $selectCorresp = $('#correspondance');
            let dataCorresp = data.listCoresspond;
            $selectCorresp.empty();
            $selectCorresp.append("<option value='0'></option>")
            $.each(dataCorresp, function (index, row) {
                $selectCorresp.append("<option value='" + row.code + "'>" + row.code + " " + row.libelle + "</option>");
            });
            LoadTableCorrespondance(data.listData);
        }
    });
}
function LoadTableCorrespondance(data) {
    document.getElementById('Ajouter').disabled = false;

    document.getElementById('Ajouter').textContent = "Ajouter";
    document.getElementById('closeSt').disabled = false;
    document.getElementById('Annuler').disabled = true;
    if (data.length == 0) {
        isEditing = true;
        $("#tab_StructCorrespondPlan tbody").empty();
        $("#Modifier, #Supprimer, #Imprimer, #Voir").prop("disabled", true);
        reset();
    } else {
        isEditing = false;
        updateTableWithDataCorresp(data);
        const table = document.getElementById("tab_StructCorrespondPlan");
        if (table.tBodies[0].rows.length > 0) {
            fillFirstRowFormCorresp(table.tBodies[0].rows[0]);
        }
        $("#Modifier, #Supprimer, #Imprimer, #Voir").prop("disabled", false);
    }
    $(".disabled_me").prop("disabled", true);
}

function updateTableWithData(niveau, data) {
    const tableId = "#tab_" + niveau;
    const $table = $(tableId);
    const $tbody = $table.find("tbody");

    // Supprimer DataTable si déjà initialisé
    if ($.fn.DataTable.isDataTable(tableId)) {
        $table.DataTable().clear().destroy();
    }

    $tbody.empty();

    // Récupère les colonnes visibles + leur statut "hidden"
    const columns = [];
    $table.find("thead th").each(function () {
        const colName = $(this).data("field");
        const isHidden = $(this).attr("hidden") !== undefined;
        columns.push({ name: colName || "", hidden: isHidden });
    });

    // Génère les lignes
    data.forEach(item => {
        let row = "<tr>";
        columns.forEach(col => {
            const value = col.name ? (item[col.name] ?? "") : "";
            const alignRight = col.name === "format" ? "style='text-align:right'" : "";
            const hiddenAttr = col.hidden ? "hidden" : "";

            // Champs spéciaux affichés en checkbox désactivée
            switch (IDButton) {
                case "StructPlanCompt":
                    const checkboxFields = ["collectif", "gestionImmo", "budget", "acti", "geo", "fin", "plan6","NOIMPUTJLTRESOR", "status"];
                    const checkedAttr = (value === true || value === "1" || value === 1 || value === "True") ? "checked" : "";
                    if (checkboxFields.includes(col.name)) {
                        row += `<td ${alignRight} ${hiddenAttr} style="text-align:center"><input type="checkbox" disabled ${checkedAttr}></td>`;
                    } else {
                        row += `<td ${alignRight} ${hiddenAttr}>${value}</td>`;
                    }
                    break;
                default:
                    row += `<td ${alignRight} ${hiddenAttr}>${value}</td>`;
                    break;
            }
        });
        row += "</tr>";
        $tbody.append(row);
    });


    // Réinitialise et configure DataTable
    $table.DataTable({
        "pageLength": 10,
        "lengthMenu": [[10, 50, 100, 150, 200, -1], [10, 50, 100, 150, 200, "Tous"]],
        "responsive": false,
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

    // Nettoie classe si ajoutée par DataTables
    $table.removeClass("dataTable");
    $("#tab_" + niveau + " colgroup").remove();
}
function updateTableWithDataCorresp(data) {
    const tableId = "#tab_StructCorrespondPlan";
    const $table = $(tableId);
    const $tbody = $table.find("tbody");

    // Supprimer DataTable si déjà initialisé
    if ($.fn.DataTable.isDataTable(tableId)) {
        $table.DataTable().clear().destroy();
    }

    $tbody.empty();

    // Récupère les colonnes visibles + leur statut "hidden"
    const columns = [];
    $table.find("thead th").each(function () {
        const colName = $(this).data("field");
        const isHidden = $(this).attr("hidden") !== undefined;
        columns.push({ name: colName || "", hidden: isHidden });
    });
    // Génère les lignes
    data.forEach(item => {
        let row = "<tr>";
        columns.forEach(col => {
            const value = col.name ? (item[col.name] ?? "") : "";
            const alignRight = col.name === "format" ? "style='text-align:right'" : "";
            const hiddenAttr = col.hidden ? "hidden" : "";

            // Champs spéciaux affichés en checkbox désactivée

            row += `<td ${alignRight} ${hiddenAttr}>${value}</td>`;
        });
        row += "</tr>";
        $tbody.append(row);
    });
    // Réinitialise et configure DataTable
    $table.DataTable({
        "pageLength": 10,
        "lengthMenu": [[10, 50, 100, 150, 200, -1], [10, 50, 100, 150, 200, "Tous"]],
        "responsive": false,
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

    // Nettoie classe si ajoutée par DataTables
    $table.removeClass("dataTable");
    $("#tab_StructCorrespondPlan colgroup").remove();
}
function fillFirstRowForm(niveau, firstRow) {
    // Retirer la sélection précédente
    $("#tab_" + niveau + " tbody tr").removeClass("selected");

    // Ajouter la classe 'selected' à la première ligne
    const $firstRow = $(firstRow);
    $firstRow.addClass("selected");

    // Appeler le remplissage automatique en simulant un clic
    chargerValeursDepuisLigne(firstRow, niveau);
}

//function fillFirstRowForm(id, firstRow) {
//    const inputs = {};
//    const possibleFields = ["code", "libelle", "superClass", "codeConvention", "codeCategorie","codeSousCat", "checkActif"];

//    for (let cellIndex = 0; cellIndex < firstRow.cells.length; cellIndex++) {
//        const cell = firstRow.cells[cellIndex];
//        const value = cell?.textContent.trim() ?? "";
//        const fieldId = possibleFields[cellIndex];
//        if (!fieldId || $("#" + fieldId).length === 0) continue;
//        alert(fieldId)
//        // Spécial traitement pour checkboxes
//        if (fieldId === "checkActif") {
//            alert(value)
//            const $checkbox = $("#" + fieldId);
//            $checkbox.prop("checked", value === "1" || value.toLowerCase() === "true" || value.toLowerCase() === "True");
//            continue;
//        }

//        // Traitement spécial pour superClass (dropdownlist)
//        if (fieldId === "superClass" && $("#" + fieldId).is("select")) {
//            var classSup = firstRow.cells[10]?.textContent.trim();
//            const $select = $("#" + fieldId);
//            $select.val(classSup).trigger('change'); // trigger pour Select2 ou autre
//            inputs[fieldId] = value;
//            continue;
//        }

//        // Cas générique
//        $("#" + fieldId).val(value);
//        inputs[fieldId] = value;
//    }

//    $(firstRow).addClass("selected").siblings().removeClass("selected");
//}
function fillFirstRowFormCorresp(firstRow) {
    const inputs = {};
    const possibleFields = ["code", "correspondance"];

    for (let cellIndex = 0; cellIndex < firstRow.cells.length; cellIndex++) {
        const cell = firstRow.cells[cellIndex];
        const value = cell?.textContent.trim() ?? "";
        const fieldId = possibleFields[cellIndex];
        if (!fieldId || $("#" + fieldId).length === 0) continue;

        // Traitement spécial pour code (dropdownlist)
        if (fieldId === "code" && $("#" + fieldId).is("select")) {
            var classSupC = firstRow.cells[1]?.textContent.trim();
            const $select = $("#" + fieldId);
            $select.val(classSupC).trigger('change'); // trigger pour Select2 ou autre
            inputs[fieldId] = value;
            continue;
        }
        // Traitement spécial pour correspondance (dropdownlist)
        if (fieldId === "correspondance" && $("#" + fieldId).is("select")) {
            var classSup = firstRow.cells[2]?.textContent.trim();
            const $select = $("#" + fieldId);
            $select.val(classSup).trigger('change'); // trigger pour Select2 ou autre
            inputs[fieldId] = value;
            continue;
        }
        numEnregCores = firstRow.cells[0]?.textContent.trim();
        // Cas générique
        $("#" + fieldId).val(value);
        inputs[fieldId] = value;
    }

    $(firstRow).addClass("selected").siblings().removeClass("selected");
}


function CodeNiveau() {
    const $select = $('#Choixniveau');
    const $code = $('#code');
    const $next = $('#next_niveau');
    const selectedVal = parseInt($select.val(), 10);
    const divVisible = $('#divTo_niveau').is(':visible');

    $select.prop('disabled', true);
    $code.off('keydown input keyup').val('').removeAttr('readonly');

    // Calculer la longueur totale du format cumulé jusqu’au niveau sélectionné
    let totalFormatLength = 0;
    $select.find('option').each(function () {
        const val = parseInt($(this).val(), 10);
        const fmt = String($(this).data('format') ?? '');
        if (val <= selectedVal) totalFormatLength += fmt.length;
    });

    const currentFormat = String($select.find('option:selected').data('format') ?? '');
    const previousLength = totalFormatLength - currentFormat.length;

    if (!divVisible) {
        // Mode SANS préfixe
        $code.attr('maxlength', totalFormatLength);
        appliquerFormat($code[0], currentFormat);
        afficherAideFormat('', currentFormat);
    } else {
        // Mode AVEC préfixe
        $next.prop('disabled', true);
        const prefix = $next.val() ?? '';
        const prefixLength = prefix.length;
        const suffixLength = totalFormatLength - prefixLength;

        $code.val(prefix).attr('maxlength', totalFormatLength);

        if (suffixLength <= 0) {
            $code.prop('readonly', true);
        } else {
            // Empêche la suppression du préfixe
            $code.on('keydown', function (e) {
                if (this.selectionStart <= prefixLength &&
                    ['Backspace', 'Delete'].includes(e.key)) {
                    e.preventDefault();
                }
            });

            // Réinsère automatiquement le préfixe s’il est supprimé
            $code.on('input', function () {
                if (!this.value.startsWith(prefix)) {
                    this.value = prefix + this.value.slice(prefix.length);
                }
            });

            appliquerFormat($code[0], currentFormat, prefixLength);
            afficherAideFormat(prefix, '_'.repeat(suffixLength));
        }
    }

    // Mise en majuscule automatique à chaque frappe
    $code.on('keyup', function () {
        this.value = this.value.toUpperCase();
        $('.input_focus').siblings('span.erreur').hide();
    });
    $code.focus()[0].setSelectionRange($code.val().length, $code.val().length);

}
function appliquerFormat(input, format, startIndex = 0) {
    if (/^[A]+$/.test(format)) {
        formatAlpha(input, startIndex);
    } else if (/^[9]+$/.test(format)) {
        formatNumber(input, startIndex);
    } else {
        formatAlphaNumber(input, startIndex);
    }
}

function afficherAideFormat(prefix, suffixPlaceholder) {
    $('#aide_format').text(`Code attendu : ${prefix}${suffixPlaceholder}`);
}
//format numerique 9
function formatNumber(input) {
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
        if (!isAllowedKey) event.preventDefault();
    });
}
//format Apha A
function formatAlpha(input) {
    input.addEventListener('keydown', function (event) {
        const key = event.key;
        const isLetter = /^[a-zA-Z]$/.test(key);
        const isAllowedKey = (
            isLetter ||
            key === 'Backspace' ||
            key === 'Delete' ||
            key === 'ArrowLeft' ||
            key === 'ArrowRight' ||
            key === 'ArrowUp' ||
            key === 'ArrowDown' ||
            key === 'Tab'
        );
        if (!isAllowedKey) event.preventDefault();
    });
}
//format Alphanumerique C
function formatAlphaNumber(input) {
    input.addEventListener('keydown', function (event) {
        const key = event.key;
        const isLetter = /^[a-zA-Z]$/.test(key);
        const isNumber = /^[0-9]$/.test(key);
        const isAllowedKey = (
            isLetter || isNumber ||
            key === 'Backspace' || key === 'Delete' ||
            key === 'ArrowLeft' || key === 'ArrowRight' ||
            key === 'ArrowUp' || key === 'ArrowDown' || key === 'Tab'
        );
        if (!isAllowedKey) event.preventDefault();
    });
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
function moveSelected(fromId, toId) {
    const from = document.getElementById(fromId);
    const to = document.getElementById(toId);
    Array.from(from.selectedOptions).forEach(option => {
        to.appendChild(option);
    });
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