$(function () {
    paramater();
})
function paramater() {
    var pageName = $("#pageName").val();
    var titre = document.getElementById('nameTitre');
    switch (pageName) {
        case "Pays":
            titre.textContent = "SAISIE DES PAYS";
            break;
    }
    formTable(pageName);
}
function formTable(pageName) {
    var list = "";
    switch (pageName) {
        case "Pays":
        case "signataire":
        case "groupes":
        case "services":
        case "unite":
            list = `
                    <div class="row">
                        <div class="col-md-12" style="padding-bottom:10px">
                            <div class="float-end">
                                <button class="btn btn-sm btn-primary" id="Ajout" onclick="Ajout()"> <i class="fas fa-plus mr-2"></i>Ajouter</button>
                            </div>
                        </div>
                    </div>
                    <div id="niveauImpression"></div>
                    <div class="row">
                        <div class="col-md-12">
                            <table class="table table-bordered tabList">
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
    }
    $("#formParam").append(list);
}