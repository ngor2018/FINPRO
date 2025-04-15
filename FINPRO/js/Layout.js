document.querySelectorAll("a[name]").forEach(link => {
    link.addEventListener("click", function (event) {
        event.preventDefault(); // Empêcher le lien de s'ouvrir normalement

        let pageName = this.getAttribute("name"); // Récupérer le name
        let classes = this.classList; // Récupérer la liste des classes
        let controller = null;

        // Vérifier à quel contrôleur appartient le lien en fonction des classes
        switch (true) {
            case classes.contains("Home"):
                controller = "Home";
                break;
            case classes.contains("Parametrage"):
                controller = "Parametrage";
                break;
            case classes.contains("FINPRO_Codifications"):
                controller = "FINPRO_Codifications";
                break;
            case classes.contains("ComptabiliteGenerale"):
                controller = "ComptabiliteGenerale";
                break;
            case classes.contains("ComptabiliteAnalytique"):
                controller = "ComptabiliteAnalytique";
                break;
            case classes.contains("SuiviBudgetaire"):
                controller = "SuiviBudgetaire";
                break;
            case classes.contains("SuiviConvention"):
                controller = "SuiviConvention";
                break;
            case classes.contains("Immobilisations"):
                controller = "Immobilisations";
                break;
            case classes.contains("EtatsFinanciers"):
                controller = "EtatsFinanciers";
                break;
            case classes.contains("MarchesEngagements"):
                controller = "MarchesEngagements";
                break;
            case classes.contains("Decaissements"):
                controller = "Decaissements";
                break;
            case classes.contains("Utilitaires"):
                controller = "Utilitaires";
                break;
            case classes.contains("FINSTOCKParam"):
                controller = "FINSTOCKParam";
                break;
            case classes.contains("FINSTOCKSaisie"):
                controller = "FINSTOCKSaisie";
                break;
            case classes.contains("Exploitations"):
                controller = "Exploitations";
                break;
            case classes.contains("Consommations"):
                controller = "Consommations";
                break;
            case classes.contains("Fichiers"):
                controller = "Fichiers";
                break;
            default:
                console.warn("Aucun contrôleur correspondant trouvé.");
                return;
        }
        // Retirer la classe 'active' de tous les liens
        document.querySelectorAll("a[name]").forEach(a => a.classList.remove("active"));
        // Ajouter la classe 'active' au lien cliqué
        this.classList.add("active");
        //if (controller && pageName) {
        //    let url = `/${controller}/${pageName}`; // Construire l'URL
        //    window.location.href = url; // Rediriger vers l'URL correspondante
        //}
        let url = `/${controller}/${pageName}`; // Construire l'URL
        console.log("Redirection vers :", url); // Debugging
        window.location.href = url; // Rediriger vers l'URL correspondante
    });
});