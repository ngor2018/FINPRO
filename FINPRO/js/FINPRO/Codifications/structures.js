var isEditing = false;
$(function () {
    $("#closeSt").click(function () {
        document.getElementById('fullscreen_popup').style.display = "none";
    })
    $("#contentTab tbody").on("click", "tr", function () {
        if (isEditing) return; // Désactiver si en mode édition
        $(this).toggleClass("selected").siblings(".selected").removeClass("selected");
        var niveau = this.cells[0].innerHTML;
        var libelle = this.cells[1].innerHTML;
        var abreviation = this.cells[2].innerHTML;
        var format = this.cells[3].innerHTML;
        var titre = this.cells[4].innerHTML;
        var abreviationTitre = this.cells[5].innerHTML;
        $("#niveau").val(niveau);
        $("#libelle").val(libelle);
        $("#abreviation").val(abreviation);
        $("#format").val(format);
        $("#titre").val(titre);
        $("#abreviationTitre").val(abreviationTitre);
    })
})
var StructPlanBudget = function () {
    toggleForms("partieBudget");
    document.getElementById('titleStruct').textContent = "Structure Plan Budgétaire";
    var button = document.getElementById('StructPlanBudget').textContent;
    GedData(button);
}
var Ajouter = function () {
    var selectButton = document.getElementById('Ajouter');
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
        default:
    }
}
var Annuler = function () {
    isEditing = false;
    var button = document.getElementById('StructPlanBudget').textContent;
    GedData(button);
    $(".disabled_me").prop("disabled", true);
    $(".input_focus").siblings('span.erreur').css('display', 'none');
}
function GedData(button) {
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: {
            id: button,
        },
        url: '/Codifications/GetListDataStruct',
        success: function (data) {
            document.getElementById('Ajouter').textContent = "Ajouter";
            document.getElementById('Ajouter').disabled = false;
            document.getElementById('closeSt').disabled = false;
            document.getElementById('Annuler').disabled = true;
            $("#contentTab tbody").empty();
            if (data.length == 0) {
                document.getElementById('Imprimer').disabled = true;
                document.getElementById('Modifier').disabled = true;
                document.getElementById('Supprimer').disabled = true;

                resetForm();
            } else {
                data.forEach(item => {
                    var list = `
                        <tr>
                            <td>${item.niveau}</td>
                            <td>${item.libelle}</td>
                            <td>${item.abreviation}</td>
                            <td>${item.format}</td>
                            <td hidden>${item.titre}</td>
                            <td hidden>${item.abreviationTitre}</td>
                        </tr>`;
                    $("#contentTab tbody").append(list);
                });
                var table = document.getElementById("contentTab");
                if (table && table.tBodies[0].rows.length > 0) {
                    var firstRow = table.tBodies[0].rows[0];
                    var niveau = firstRow.cells[0].textContent.trim();
                    var libelle = firstRow.cells[1].textContent.trim();
                    var abreviation = firstRow.cells[2].textContent.trim();
                    var format = firstRow.cells[3].textContent.trim();
                    var titre = firstRow.cells[4].textContent.trim();
                    var abreviationTitre = firstRow.cells[5].textContent.trim();

                    $("#niveau").val(niveau);
                    $("#libelle").val(libelle);
                    $("#abreviation").val(abreviation);
                    $("#format").val(format);
                    $("#titre").val(titre);
                    $("#abreviationTitre").val(abreviationTitre);
                    $(firstRow).addClass("selected").siblings().removeClass("selected");

                }
                document.getElementById('Imprimer').disabled = false;
                document.getElementById('Modifier').disabled = false;
                document.getElementById('Supprimer').disabled = false;
            }
            $(".disabled_me").prop("disabled", true);
        }
    })
}
function resetForm() {
    $(".input_focus").val('');
    $('.input_focus').siblings('span.erreur').css('display', 'none');
}
function toggleForms(showId) {
    // Liste des IDs des formulaires
    let forms = ["partieBudget", ""];
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