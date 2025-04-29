var pageName = $("#pageName").val();
var nameidCodeBar = null;
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
var ajoutArticle = function () {
    toggleFormsPopup("partieUnique");
    var code1 = $("#site1").val();
    var code2 = $("#site2").val();
    $("#codeBar").val("");
    nameidCodeBar = null;
    GetDataArticleInsertStock(code1, code2)
}
var validerInOut = function () {
    var objData = {};
    var listOfAffect = [];
    const table = document.getElementById('tab_Article');
    const tbodyRows = table.querySelector('tbody').rows;

    if (tbodyRows.length === 0) {
        document.getElementById('tabArticleVide').textContent = "Veuillez sélectionner des articles";
    } else {
        var exercice = $("#exercice").val();
        var numBon = $("#numBon").val();
        var numBl = $("#numBL").val();
        var dateSaisie = $("#dateSaisie").val();
        var compte = $("#compte").val();
        var compteAuxi = $("#compteAux").val();
        var site = $("#site1").val();
        var magasin = $("#site2").val();

        // Parcourir uniquement le tbody !
        $("#tab_Article tbody tr").each(function () {
            var $row = $(this);
            var OrderDetailAffect = {};

            OrderDetailAffect.code = $row.find('td:eq(0)').text().trim();
            OrderDetailAffect.libelle = $row.find("td:eq(2) input").val();
            OrderDetailAffect.commentaire = $row.find("td:eq(2) input").val();
            OrderDetailAffect.PU = $row.find("td:eq(4) input").val().replace(/\s/g, '');
            OrderDetailAffect.Qte = $row.find("td:eq(5) input").val().replace(/\s/g, '');
            OrderDetailAffect.valeur = $row.find('td:eq(6)').text().trim().replace(/\s/g, '');
            OrderDetailAffect.TVA = $row.find("td:eq(7) input").val().replace(/\s/g, '');
            OrderDetailAffect.montantHT = $row.find('td:eq(8)').text().trim().replace(/\s/g, '');
            OrderDetailAffect.montantTVA = $row.find('td:eq(9)').text().trim().replace(/\s/g, '');

            listOfAffect.push(OrderDetailAffect);
        });

        objData.annee = exercice;
        objData.numBon = numBon;
        objData.numBl = numBl;
        objData.dateDebut = dateSaisie;
        objData.compte = compte;
        objData.compteAuxi = compteAuxi;
        objData.site = site;
        objData.magasin = magasin;
        objData.tabList = listOfAffect;

        document.getElementById('validerInOut').disabled = true;
        document.getElementById('validerInOut').textContent = "Traitement en cours...";

        $.ajax({
            async: true,
            type: 'POST',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(objData),
            url: '/CRUD/AllInOutArticle',
            success: function (data) {
                $('.alert_Param').removeClass("hide").addClass("show showAlert");
                $(".result_Param").html('<font style="color:#ce8500">' + data.message + '</font>');
                setTimeout(function () {
                    document.getElementById('validerInOut').disabled = false;
                    document.getElementById('validerInOut').textContent = "Valider";
                    $('.alert_Param').addClass("hide").removeClass("show");
                    $("#tab_Article tbody").empty();
                    $("#tab_Article tfoot").empty();
                }, 2500);
            },
            error: function () {
                alert('Erreur lors de l\'enregistrement');
            }
        });

    }
    setTimeout(function () {
        document.getElementById('tabArticleVide').textContent = "";
    },2500)
}

function LookAllAffect() {
    var table = $('#tabAffect_' + pageName).DataTable();
    var listOfAffect = [];

    table.rows().every(function () {
        var $row = $(this.node());
        var isChecked = $row.find('td:eq(0) input[type="checkbox"]').prop('checked');
        if (isChecked) {
            listOfAffect.push({
                code: $row.find('td:eq(1)').text().trim(),
                libelle: $row.find('td:eq(2)').text().trim(),
                PU: $row.find('td:eq(3)').text().trim()
            });
        }
    });

    if (listOfAffect.length === 0) {
        $('#etatCocheError').text("Veuillez cocher au moins une ligne à affecter !");
        return;
    } else {
        $('#etatCocheError').text(""); // Clear error if any
    }

    const $tbody = $('#tab_Article').closest('table').find('tbody');

    listOfAffect.forEach(item => {
        let existe = false;
        $tbody.find('tr').each(function () {
            const codeExistant = $(this).find('td:eq(0)').text().trim();
            if (codeExistant === item.code) {
                existe = true;
                return false; // Break
            }
        });

        if (!existe) {
            const row = `
                <tr>
                    <td class="code-cell" style="width:8%" title="${item.libelle}">${item.code}</td>
                    <td style="display:none;"><input type="hidden" class="form-control form-control-sm libelle" value="${item.libelle}" /></td>
                    <td style="display:none;"><input type="hidden" class="form-control form-control-sm libelleSaisie" value="${item.libelle}" /></td>
                    <td style="display:none;"><input type="hidden" class="form-control form-control-sm Commentaire" value="" /></td>
                    <td style="width:15%"><input type="text" style="text-align:right" class="form-control form-control-sm PU" value="${formatNombre(item.PU)}" /></td>
                    <td style="width:8%"><input type="text" class="form-control form-control-sm Qte" value="1" /></td>
                    <td class="valeur" style="width:8%">0</td>
                    <td style="width:6%"><input type="text" class="form-control form-control-sm TVA" value="0" /></td>
                    <td class="montantHT" style="width:8%">0</td>
                    <td class="montantTVA" style="width:8%">0</td>
                    <td class="montantTTC" style="width:8%">0</td>
                    <td class="text-center" style="width:4%">
                        <button type="button" class="btn-del" style="color:red;border:none">
                            <i class="far fa-minus-square"></i>
                        </button>
                    </td>
                </tr>`;
            $tbody.append(row);
        }
    });

    $tbody.find('input').each(function () {
        formatChiffreInputAvecSepMilier(this);
    });

    $tbody.off('keyup input').on('keyup input', 'input', function () {
        calculerToutesLesLignes();
    });

    calculerToutesLesLignes();
    $('#fermer_').trigger('click');

    // Click sur la cellule de code pour modifier libellé/commentaire
    $tbody.off('click.codeCell').on('click.codeCell', '.code-cell', function () {
        const $td = $(this);
        const code = $td.text().trim();
        const $row = $td.closest('tr');
        const $inputLibelleSaisie = $row.find('input.libelleSaisie');
        const $inputLibelle = $row.find('input.libelle');
        const $inputCommentaire = $row.find('input.Commentaire');

        const currentLibelle = $inputLibelleSaisie.val() || $inputLibelle.val();
        const currentCommentaire = $inputCommentaire.val() || "";

        const overlay = $(`
            <div id="overlayPopup" style="
                position: fixed;top: 0;left: 0;width: 100vw;height: 100vh;
                background-color: rgba(0, 0, 0, 0.5);z-index: 9999;">
            </div>
        `);

        const popup = $(`
            <div id="popupLibelle" style="
                position: fixed;top: 30%;left: 50%;transform: translate(-50%, -50%);
                background: white;border: 1px solid #ccc;box-shadow: 0 0 10px rgba(0,0,0,0.3);
                padding: 20px;z-index: 10000;border-radius: 8px;width: 600px;">
                <h5>${code} | ${currentLibelle}</h5><hr>
                <div class="row">
                    <div class="col-md-12">
                        <div class="row mb-1">
                            <div class="col-md-2"><label>Libellé</label></div>
                            <div class="col-md-10">
                                <input type="text" class="form-control input_focus" id="libelleInput" value="${currentLibelle}"/>
                                <span class="erreur text-danger"></span>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <div class="col-md-2"><label>Commentaire</label></div>
                            <div class="col-md-10">
                                <input type="text" class="form-control input_focus" id="CommentaireInput" value="${currentCommentaire}"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-3 text-end">
                    <button class="btn btn-primary btn-sm me-2" id="validerLibelle">Valider</button>
                    <button class="btn btn-secondary btn-sm" id="fermerLibelle">Fermer</button>
                </div>
            </div>
        `);

        $('body').append(overlay, popup);

        $('#validerLibelle').on('click', function () {
            const newLibelle = $('#libelleInput').val().trim();
            const newCommentaire = $('#CommentaireInput').val().trim();
            if (!newLibelle) {
                $('#libelleInput').siblings('span.erreur').text('Champ obligatoire');
                return;
            }

            $inputLibelleSaisie.val(newLibelle);
            $inputCommentaire.val(newCommentaire);

            $row.find('td:eq(2)').html(`<input type="hidden" class="form-control form-control-sm libelleSaisie" value="${newLibelle}" />`);
            $row.find('td:eq(3)').html(`<input type="hidden" class="form-control form-control-sm Commentaire" value="${newCommentaire}" />`);

            $('#overlayPopup, #popupLibelle').remove();
        });

        $('#fermerLibelle, #overlayPopup').on('click', function () {
            $('#overlayPopup, #popupLibelle').remove();
        });
    });

    // Click bouton suppression
    $tbody.off('click.btnDel').on('click.btnDel', '.btn-del', function () {
        const $row = $(this).closest('tr');

        const overlay = $(`
            <div id="overlayDelete" style="
                position: fixed;top: 0;left: 0;width: 100vw;height: 100vh;
                background-color: rgba(0, 0, 0, 0.5);z-index: 9999;">
            </div>
        `);

        const popup = $(`
            <div id="popupDelete" style="
                position: fixed;top: 40%;left: 50%;transform: translate(-50%, -50%);
                background: white;border: 1px solid #ccc;box-shadow: 0 0 10px rgba(0,0,0,0.3);
                padding: 20px;z-index: 10000;border-radius: 8px;width: 400px;text-align:center;">
                <h5>Confirmer la suppression</h5><hr>
                <p>Voulez-vous vraiment supprimer cette ligne ?</p>
                <div class="mt-3">
                    <button class="btn btn-danger btn-sm me-2" id="confirmerSuppression">Supprimer</button>
                    <button class="btn btn-secondary btn-sm" id="annulerSuppression">Annuler</button>
                </div>
            </div>
        `);

        $('body').append(overlay, popup);

        $('#confirmerSuppression').on('click', function () {
            $row.fadeOut(300, function () {
                $(this).remove();
                calculerToutesLesLignes();
            });
            $('#overlayDelete, #popupDelete').remove();
        });

        $('#annulerSuppression, #overlayDelete').on('click', function () {
            $('#overlayDelete, #popupDelete').remove();
        });
    });
}


function calculerToutesLesLignes() {
    let totalHT = 0;
    let totalTVA = 0;
    let totalTTC = 0;
    let erreur = false;

    $('#tab_Article').closest('table').find('tbody tr').each(function () {
        const $row = $(this);
        const PUinput = $row.find('.PU');
        const Qteinput = $row.find('.Qte');
        const TVAinput = $row.find('.TVA');

        // Lire les valeurs brutes
        let PUraw = PUinput.val();
        let Qteraw = Qteinput.val();
        let TVARaw = TVAinput.val();

        // Nettoyer et convertir
        let PU = parseFloat(PUraw.replace(/\s/g, ''));
        let Qte = parseFloat(Qteraw.replace(/\s/g, ''));
        let TVA = parseFloat(TVARaw.replace(/\s/g, '')) || 0;

        // Vérification améliorée
        if (!PUraw || !Qteraw || isNaN(PU) || isNaN(Qte) || PU <= 0 || Qte <= 0) {
            PUinput.addClass('is-invalid');
            Qteinput.addClass('is-invalid');
            erreur = true;
        } else {
            PUinput.removeClass('is-invalid');
            Qteinput.removeClass('is-invalid');
        }

        const valeur = (isNaN(PU) ? 0 : PU) * (isNaN(Qte) ? 0 : Qte);
        const montantTVA = (valeur * TVA) / 100;
        const montantHT = valeur;
        const montantTTC = montantTVA + montantHT;

        $row.find('.valeur').text(formatNombre(valeur));
        $row.find('.montantTVA').text(formatNombre(montantTVA));
        $row.find('.montantHT').text(formatNombre(montantHT));
        $row.find('.montantTTC').text(formatNombre(montantTTC));

        totalHT += montantHT;
        totalTVA += montantTVA;
        totalTTC += montantTTC;
    });

    // Activer ou désactiver validerInOut à la fin
    document.getElementById('validerInOut').disabled = erreur;

    const $tfoot = $('#tab_Article').closest('table').find('tfoot');
    $tfoot.html(`
        <tr style="background-color:#77B5FE;color:#fff">
            <th colspan="5" style="text-align:center">Total :</th>
            <th>${formatNombre(totalHT)}</th>
            <th>${formatNombre(totalTVA)}</th>
            <th>${formatNombre(totalTTC)}</th>
            <th></th>
        </tr>
    `);

    if (erreur) {
        console.warn("Certains champs PU ou Qte sont invalides ou vides !");
    }
}


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
function formatChiffreInputAvecSepMilier(input) {
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

    input.addEventListener('input', function () {
        let value = input.value.replace(/\s/g, '');
        if (!isNaN(value) && value !== "") {
            input.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        }
    });
}

// Utilitaire pour formatter initialement
function formatNombre(val) {
    let v = ('' + val).replace(/\s/g, '');
    let n = parseFloat(v);
    if (!isNaN(n)) {
        return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    return val;
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
                                            <div class="col-md-4" style="border:1px solid #c1baba;border-radius:5px 0 0 5px;padding-top:8px">
                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <strong>Exercice :</strong>&nbsp;&nbsp;<span id="valExercice"></span>
                                                    </div>
                                                </div>
                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <strong>No Bon :</strong>&nbsp;&nbsp;<span id="valBon"></span>
                                                    </div>
                                                </div>
                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <strong>No BL :</strong>&nbsp;&nbsp;<span id="valBL"></span>
                                                    </div>
                                                </div>
                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <strong>Date :</strong>&nbsp;&nbsp;<span id="valDate"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-8" style="border:1px solid #c1baba;border-left:none;border-radius:0 5px 5px 0;padding-top:8px">
                                                <div class="row mb-1">
                                                    <div class="col-md-12">
                                                        <strong>Compte :</strong>&nbsp;&nbsp;<span id="valCompte"></span>
                                                    </div>
                                                </div>
                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <strong>Compte auxiliaire :</strong>&nbsp;&nbsp;<span id="valCompteAuxi"></span>
                                                    </div>
                                                </div>
                                                <div class="row">
                                                    <div class="col-md-3">
                                                        <label for="site1">Site</label>
                                                    </div>
                                                    <div class="col-md-9">
                                                        <select id="site1" class="input_focus selectChoix" style="width:100%">
                                                            
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="row" style="padding-top:4px">
                                                    <div class="col-md-3">
                                                        <label for="site2">Magasin</label>
                                                    </div>
                                                    <div class="col-md-9">
                                                        <select id="site2" class="input_focus selectChoix" style="width:100%">
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="row mb-1" style="padding-top:8px">
                                                    <div class="col-md-12">
                                                        <div class="float-start" style="width:70%">
                                                            <div class="row">
                                                                <div class="col-md-4">
                                                                    <label for="codeBar">Code barre</label>
                                                                </div>
                                                                <div class="col-md-8">
                                                                    <input type="text" id="codeBar" maxlength="14" class="input_focus"/>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="float-end">
                                                            <button id="ajoutArticle" style="border:1px solid #808080;" onclick="ajoutArticle()">Ajout article</button>
                                                        </div>
                                                    </div>
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
                                        <div class="row justify-content-center" style="text-align:center">
                                            <div class="col-md-12">
                                                <span id="tabArticleVide" style="color:red"></span>
                                            </div>
                                        </div>
                                        <div class="row" style="padding-top:8px">
                                            <div class="col-md-12" style="max-height: 300px; overflow-y: auto">
                                                <table class="tabList" style="width:100%" id="tab_Article">
                                                    <thead class="sticky-top">
                                                        <tr>
                                                            <th rowspan="2">Article</th>
                                                            <th rowspan="2" hidden>Libellé</th>
                                                            <th rowspan="2" hidden>Libellé Saisie</th>
                                                            <th rowspan="2" hidden>Commentaire</th>
                                                            <th rowspan="2">PU</th>
                                                            <th rowspan="2">Qte</th>
                                                            <th rowspan="2">Valeur</th>
                                                            <th rowspan="2">TVA</th>
                                                            <th colspan="3">Montant</th>
                                                            <th rowspan="2"></th>
                                                        </tr>
                                                        <tr>
                                                            <th>Hors TVA</th>
                                                            <th>TVA</th>
                                                            <th>TTC</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody></tbody>
                                                    <tfoot></tfoot>
                                                </table>
                                            </div>
                                        </div>
                                        <div class="row justify-content-center" style="text-align:center;padding-top:10px">
                                            <div class="col-md-12">
                                                <button class="btn btn-sm btn-success" id="validerInOut" onclick="validerInOut()">Valider</button>
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
    //var codeBar = document.getElementById('codeBar');
    //formatChiffreInput(codeBar);
    $(".selectChoix").select2();
    popupArticle();
    GetSiteMagasin($("#site1").val());
    $("#fermer_").click(function () {
        document.getElementById('fullscreen_popup').style.display = "none";
    })
    // Coche/Décoche tous les checkboxes, même ceux hors page visible
    $(document).on('change', '#bulk-select-example', function () {
        const checked = $(this).is(':checked');
        const table = $('#tabAffect_' + pageName).DataTable();
        table.rows().every(function () {
            const node = this.node();
            $(node).find('input[type="checkbox"]').prop('checked', checked);
        });
        document.getElementById('etatCocheError').textContent = "";
    });
    $("#site1,#site2").change(function () {
        $("#tab_Article tbody").empty();
        $("#tab_Article tfoot").empty();
        document.getElementById('validerInOut').disabled = false;
    })
    // Quand une ligne est cochée/décochée manuellement
    $(document).on('change', '#tabAffect_' + pageName + ' tbody input[type="checkbox"]', function () {
        const table = $('#tabAffect_' + pageName).DataTable();
        let total = 0;
        let checked = 0;
        table.rows().every(function () {
            const node = this.node();
            const cb = $(node).find('input[type="checkbox"]');
            total += cb.length;
            checked += cb.filter(':checked').length;
        });
        $('#bulk-select-example').prop('checked', total > 0 && total === checked);
        document.getElementById('etatCocheError').textContent = "";
    });
    const mappingAZERTY = {
        '&': '1',
        'é': '2',
        '"': '3',
        "'": '4',
        '(': '5',
        '-': '6',
        'è': '7',
        '_': '8',
        'ç': '9',
        'à': '0'
    };
    document.getElementById('codeBar').addEventListener('input', function (e) {
        let value = e.target.value;
        let corrected = '';

        for (let i = 0; i < value.length; i++) {
            let char = value[i];
            corrected += mappingAZERTY[char] || char; // Remplace si nécessaire
        }

        e.target.value = corrected;
        var code = corrected; // Utiliser la valeur corrigée

        if (code.length === 13 && /^\d+$/.test(code)) { // ✅ Vérifie 13 chiffres exactement
            var code1 = $("#site1").val();
            var code2 = $("#site2").val();
            GetDataArticleInsertStock(code1, code2);
            nameidCodeBar = this.id;
            $("#codeBar").val('');
        }
    });
}
function popupArticle() {
    let formHTML = "";
    $("#partieUnique").empty();
    formHTML = `<div class="row justify-content-center" style="padding-top:4%">
                            <div class="col-md-8 pageView">
                                <div class="row">
                                    <div class="col-md-12" style="padding-bottom: 10px;border-bottom:1px solid #bdb8b8">
                                        <div class="float-start">
                                            <strong id="titleParam_">Liste article</strong>
                                        </div>
                                        <div class="float-end">
                                            <button class="btn btn-sm  btn-danger me-1 mb-1" id="fermer_">&times;Fermer</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="row" style='padding-top:10px'>
                                    <div class="col-md-12">
                                        <div class="row justify-content-center" style="text-align:center">
                                            <div class="col-md-12">
                                                <span id="etatCocheError" style="color:red"></span>
                                            </div>
                                        </div>
                                        <div class="row mb-2">
                                            <div class="col-md-12">
                                                <table class="tabList" style="width:100%" id="tabAffect_${pageName}">
                                                    <thead>
                                                        <tr>
                                                            <th style="text-align:center" class="white-space-nowrap fs-9 align-middle ps-0" style="max-width:20px; width:18px;">
                                                                <div class="form-check mb-0 fs-8">
                                                                    <input class="form-check-input" id="bulk-select-example" type="checkbox">
                                                                </div>
                                                            </th>
                                                            <th style="text-align:center">Code</th>
                                                            <th style="text-align:center">Libellé</th>
                                                            <th style="text-align:center">PU</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row justify-content-center" style="text-align:center">
                                    <div class="col-md-12">
                                        <button class="btn btn-sm btn-success" id="LookAllAffect" onclick="LookAllAffect()">Ajouter</button>
                                    </div>
                                </div>
                            <div>
                        <div>
                        `;
    $("#partieUnique").append(formHTML);
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

function GetSiteMagasin(code1) {
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: {
            code1: code1,
        },
        url: '/CRUD/GetSiteMagasin',
        success: function (data) {
            if ($("#site1").val() == "" || $("#site1").val() == null) {
                $('#site1').empty();
                $.each(data.list1, function (index, row) {
                    $("#site1").append("<option value='" + row.code + "'>" + row.libelle + "</option>");
                })
            }
            if ($("#site2").val() == "" || $("#site2").val() == null) {
                $('#site2').empty();
                $.each(data.list2, function (index, row) {
                    $("#site2").append("<option value='" + row.code + "'>" + row.libelle + "</option>");
                })
            }
        }
    })
}
function GetDataArticleInsertStock(code1, code2) {
    var codeBar = $("#codeBar").val();
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: {
            code1: code1,
            code2: code2,
            codeBar: codeBar
        },
        url: '/CRUD/GetDataArticleInsertStock',
        success: function (data) {
            if ($("#site1").val() == "" || $("#site1").val() == null) {
                $('#site1').empty();
                $.each(data.list1, function (index, row) {
                    $("#site1").append("<option value='" + row.code + "'>" + row.libelle + "</option>");
                })
            }
            if ($("#site2").val() == "" || $("#site2").val() == null) {
                $('#site2').empty();
                $.each(data.list2, function (index, row) {
                    $("#site2").append("<option value='" + row.code + "'>" + row.libelle + "</option>");
                })
            }
            if ($.fn.DataTable.isDataTable('#tabAffect_' + pageName)) {
                $('#tabAffect_' + pageName).DataTable().destroy();
                $("#tabAffect_" + pageName + " tbody").empty();
            }
            if (data.length > 0) {
                data.forEach(item => {
                    switch (nameidCodeBar) {
                        case "codeBar":
                            list = `<tr>
                                <td style="text-align:center" class="fs-9 align-middle">
                                    <div class="form-check mb-0 fs-8">
                                        <input checked class="form-check-input" type="checkbox">
                                    </div>
                                </td>
                                <td>${item.code}</td>
                                <td>${tronquer(item.libelle, 50)}</td>
                                <td style="text-align:right">${separateur_mil(item.prixUnitaire)}</td>
                            </tr>`;
                            break;
                        default:
                            list = `<tr>
                                <td style="text-align:center" class="fs-9 align-middle">
                                    <div class="form-check mb-0 fs-8">
                                        <input class="form-check-input" type="checkbox">
                                    </div>
                                </td>
                                <td>${item.code}</td>
                                <td>${tronquer(item.libelle, 50)}</td>
                                <td style="text-align:right">${separateur_mil(item.prixUnitaire)}</td>
                            </tr>`;
                            break;
                    }
                    $("#tabAffect_" + pageName + " tbody").append(list);
                })
                // ✅ Active les tooltips Bootstrap sur tous les éléments injectés
                $('[data-toggle="tooltip"]').tooltip();
            }
            $('#tabAffect_' + pageName).DataTable({
                "pageLength": 10,
                "lengthMenu": [[10, 50, 100, 150, 200, -1], [10, 50, 100, 150, 200, "Tous"]],
                "responsive": true,
                "lengthChange": true,
                "scrollY": '250px',       // hauteur max pour le tbody
                "scrollCollapse": true,   // réduit le scroll si peu de lignes
                "paging": true,           // tu peux mettre false si tu veux tout scroller sans pagination
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
            $("#tabAffect_" + pageName).removeClass("dataTable");
            if (nameidCodeBar == "codeBar") {
                document.getElementById('LookAllAffect').click();
            }
        }
    })
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
function toggleFormsPopup(showId) {
    // Liste des IDs des formulaires
    let forms = ["partieUnique"];
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

