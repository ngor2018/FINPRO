var pageName = $("#pageName").val();
var IDButton = null;
$(function () {
    parameter();
})
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
                                    <div class="row justify-content-center" style="text-align:center">
                                        <div class="col-md-12">
                                            <div class="alert_Param hide">
                                                <span class="fas fa-exclamation-circle"></span>
                                                <span class="result_Param"></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row" style="padding-bottom:20px">
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
                                        <div class="col-md-3">
                                            <input type="text" name="code" value="" id="code" class="input_focus" />
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-3">
                                            <label for="libelle">Libellé</label>
                                        </div>
                                        <div class="col-md-9">
                                            <input type="text" name="libelle" value="" id="libelle" class="input_focus" />
                                        </div>
                                    </div>
                                    <div id="divLastniveau">

                                    </div>
                                </div>
                                <div class="row justify-content-right" style="padding-top:10px;padding-bottom:10px;;text-align:right">
                                    <div class="col-md-12">
                                        <button class="btn btn-secondary btn-sm" type="button" id="Ajouter" onclick="Ajouter()">Ajouter</button>
                                        <button class="btn btn-secondary btn-sm" type="button" id="Modifier" onclick="Modifier()">Modifier</button>
                                        <button class="btn btn-danger btn-sm" type="button" id="Supprimer" onclick="Supprimer()">Supprimer</button>
                                        <button class="btn btn-danger btn-sm" type="button" id="Annuler" onclick="Annuler()">Annuler</button>
                                        <button class="btn btn-danger btn-sm" type="button" id="closeSt">Fermer</button>
                                    </div>
                                </div>
                                <div id="partieTab">
                            
                                </div>
                            </div>
                        </div>
                        `;
            break;
    }
    container.insertAdjacentHTML("beforeend", formHTML);
    let button = document.getElementById(IDButton);
    document.getElementById('titleStruct').textContent = button.textContent;
    vueTable();
    controleInput();
    DataNiveau();
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
                        <div class="col-md-12" style="max-height: 200px; overflow-y: auto">
                            <table class="table-bordered tabList" id="tab_${IDButton}" width="100%" tabindex="0">
                                <thead class="sticky-top bg-white">
                                    <tr>
                                        <th data-field="code">code</th>
                                        <th data-field="libelle">Libellé</th>
                                        <th data-field="niveau">Niveau</th>
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
                        <div class="col-md-12" style="max-height: 200px; overflow-y: auto">
                            <table class="table-bordered tabList" id="tab_${IDButton}" width="100%" tabindex="0">
                                <thead class="sticky-top bg-white">
                                    <tr>
                                        <th data-field="code">code</th>
                                        <th data-field="libelle">Libellé</th>
                                        <th data-field="niveau">Niveau</th>
                                        <th data-field="compteCollectif">Compte Collectif</th>
                                        <th data-field="compteSuiviImmo">Compte Suivi en Immobilisation</th>
                                        <th data-field="budget">Budget</th>
                                        <th data-field="analyt">Analyt.</th>
                                        <th data-field="geo">Géo.</th>
                                        <th data-field="finance">Finance</th>
                                        <th data-field="status">Status</th>
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
                                <select id="superClass" class="choixSelect input_focus" style="width:100%">
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
                                        <input class="form-check-input" id="checkActif" type="checkbox" value="" style="cursor:pointer"/>
                                        <label class="form-check-label" style="cursor:pointer" for="checkActif"><strong>Actif</strong></label>
                                    </div>
                                </div>
                            </div>
                        `;
            break;
        case "StructPlanCompt":
            formHTML = `
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
                                                <h1>Caracteristiques</h1>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="tab-pane fade" id="tab-ActiviteRatt" role="tabpanel" aria-labelledby="ActiviteRatt-tab">
                                        <div class="row" style="padding-bottom:10px">
                                            <div class="col-md-12">
                                                <h1>ActiviteRatt</h1>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="tab-pane fade" id="tab-BudgetRatt" role="tabpanel" aria-labelledby="BudgetRatt-tab">
                                        <div class="row" style="padding-bottom:10px">
                                            <div class="col-md-12">
                                                <h1>BudgetRatt</h1>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="tab-pane fade" id="tab-ComportDefaut" role="tabpanel" aria-labelledby="ComportDefaut-tab">
                                        <div class="row" style="padding-bottom:10px">
                                            <div class="col-md-12">
                                                <h1>ComportDefaut</h1>
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
function controleInput() {
    $('.choixSelect').select2();
    $("#closeSt").click(function () {
        document.getElementById('fullscreen_popup').style.display = "none";
    })
    $('#Choixniveau').on('change', function () {
        let selectedIndex = this.selectedIndex;
        let total = this.options.length;

        const select = document.getElementById("Choixniveau");
        const selectedOption = select.options[selectedIndex];

        let nameAttr = "";
        if (selectedIndex > 0) {
            // Récupérer le name de l'option précédente
            const previousOption = select.options[selectedIndex - 1];
            nameAttr = previousOption.getAttribute("name");
        }
        //alert('mario '+nameAttr)
        //if (total === 1 || selectedIndex === total - 1) { //Dernière option sélectionnée.
        if (selectedIndex === total - 1) { //Dernière option sélectionnée.
            //alert(1)
            vueLastNiveau();
            document.getElementById('label_next_niveau').textContent = nameAttr;
            $('#divTo_niveau').show();
            $(this).attr('data-position', 'last');
        } else if (selectedIndex === 0) {  //Première option sélectionnée.
            //alert(0)
            vueFirstNiveau();
            $('#divTo_niveau').hide();
            document.getElementById('label_next_niveau').textContent = ""; // Rien avant la première option
            $(this).attr('data-position', 'first');
        } else {  //Option du milieu sélectionnée.
            $('#divTo_niveau').show();
            document.getElementById('label_next_niveau').textContent = nameAttr;
            document.getElementById('divLastniveau').innerHTML = "";
            $(this).removeAttr('data-position');
        }
    });

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
            const $select = $('#Choixniveau');
            $select.empty();
            let list = data.listData;
            if (list.length === 0) {
                $('#divTo_niveau').hide();
                return;
            }

            if (!list || list.length === 0) return;

            $.each(list, function (index, row) {
                $select.append("<option value='" + row.niveau + "' name='" + row.abreviation + "'>" + row.niveau + " " + row.libelle + "</option>");
            });

            if (list.length === 1) { //Une seule option : considérée comme dernière.");
                vueLastNiveau();
                $('#divTo_niveau').hide();
                $select.attr('data-position', 'last');
            } else {  // Première option sélectionnée par défaut.");
                vueFirstNiveau();
                $select.attr('data-position', 'first');
            }
        }
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