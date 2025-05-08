using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using DBINSTALL;
using BDD;
using FINPRO.Models;

namespace FINPRO.Controllers
{
    public class FINPRO_CodificationsController : Controller
    {
        // GET: FINPRO_Codifications
        SqlCommand com = new SqlCommand();
        SqlDataReader dr;
        SqlConnection conn = new SqlConnection(GetConnexion.GetConnectionString());
        parametre parametre = new parametre();
        
        public ActionResult Structures()
        {
            if (Session["LOGIN"] == null)
            {
                return RedirectToAction("Index", "Home");
            }
            else
            {
                ViewBag.NameTitrecontroller = "FINPRO";
                ViewBag.Projet = "Structures";
                ViewBag.Controleur = "Codification";
                return View(parametre);
            }
        }
        public ActionResult PlanCompte()
        {
            if (Session["LOGIN"] == null)
            {
                return RedirectToAction("Index", "Home");
            }
            else
            {
                ViewBag.NameTitrecontroller = "FINPRO";
                ViewBag.Projet = "PlanCompte";
                ViewBag.Controleur = "Plans de comptes";
                return View();
            }
        }
        public ActionResult ParametreGeneraux()
        {
            if (Session["LOGIN"] == null)
            {
                return RedirectToAction("Index", "Home");
            }
            else
            {
                ViewBag.Projet = "FINPRONET";
                ViewBag.Controleur = "Paramètres généraux";
                return View();
            }
        }
        [HttpGet]
        public JsonResult GetNameButton()
        {
            var rStruBudget = new Tables.rStruPost();
            var rStruPlanCompte = new Tables.rStruCoge();
            var rStruActivite = new Tables.rStruActi();
            var rStruZone = new Tables.rStruGeo();
            var rStruPlan6 = new Tables.rStruPlan6();
            var rStruEmplacement = new Tables.rStruEmplacement();
            var rStruP1 = new Tables.RSTRUPLAN1EXT();
            var rStruP2 = new Tables.RSTRUPLAN2EXT();
            var rStruP3 = new Tables.RSTRUPLAN3EXT();
            var rStruP4 = new Tables.RSTRUPLAN4EXT();

            string GetTitreCourt(DataTable table, string defaultValue)
            {
                if (table.Rows.Count > 0)
                {
                    var titre = table.Rows[0]["TitreCourt"]?.ToString()?.Trim();
                    if (!string.IsNullOrEmpty(titre))
                        return titre;
                }
                return defaultValue;
            }
            Tables.rProjet rProjet = new Tables.rProjet();
            DataTable tabProjet = rProjet.RemplirDataTable();
            bool etatPlan6 = (bool)tabProjet.Rows[0]["SuiviPlan6"];
            var data = new
            {
                statutP6 = etatPlan6,

                budget = GetTitreCourt(rStruBudget.RemplirDataTable(), "Budget"),
                PlanCompte = "Plan comptable", // Fixe
                activite = GetTitreCourt(rStruActivite.RemplirDataTable(), "Activité"),
                zones = GetTitreCourt(rStruZone.RemplirDataTable(), "Géo"),
                plan6 = GetTitreCourt(rStruPlan6.RemplirDataTable(), "Plan 6"),
                emplacement = "Emplacements", // Fixe
                p1 = GetTitreCourt(rStruP1.RemplirDataTable(), "Plan 1"),
                p2 = GetTitreCourt(rStruP2.RemplirDataTable(), "Plan 2"),
                p3 = GetTitreCourt(rStruP3.RemplirDataTable(), "Plan 3"),
                p4 = GetTitreCourt(rStruP4.RemplirDataTable(), "Plan 4"),
            };

            return Json(data, JsonRequestBehavior.AllowGet);
        }
        public JsonResult GetListDataCorrespondance(string niveau)
        {
            var listCode = new List<parametre>();
            var listCoresspond = new List<parametre>();
            var listData = new List<parametre>();
            DataTable tabCode = new DataTable();
            DataTable tabCoresspond = new DataTable();
            DataTable tabListData = new DataTable();
            var tableMapping = new Dictionary<string, (object tableInstance, object tablePostInstance)>
                {
                    { "P1Activite-tab", (new Tables.RPLAN1EXT(), new Tables.RCORPLAN1EXT()) }, //P1 Activite
                    { "P2Zones-tab", (new Tables.RPLAN2EXT(), new Tables.RCORPLAN2EXT()) }, //P2 Zones
                    { "P3Budget-tab", (new Tables.RPLAN3EXT(), new Tables.RCORPLAN3EXT()) },  //P3 Budget
                    { "P4Compte-tab", (new Tables.RPLAN4EXT(), new Tables.RCORPLAN4EXT()) },        //P4 Compte
                    // Ajoute d'autres mappings ici si nécessaire
                };
        }

        public JsonResult GetListDataNiveau2(string niveau,string code1,string code2)
        {
            var listNiveau2 = new List<parametre>();
            var listtab = new List<parametre>();
            var filtre = string.Empty;
            var filtreTab = string.Empty;
            DataTable objNiveau2 = new DataTable();
            DataTable objTab = new DataTable();
            // Mapping ID -> instances des tables
            var tableMapping = new Dictionary<string, (object tableInstance, object tablePostInstance)>
                {
                    { "StructPlanBudget", (new Tables.rStruPost(), new Tables.rPost1()) }, //Budget
                    { "StructPlanCompt", (new Tables.rStruCoge(), new Tables.rCoge1()) }, //Plan Compte
                    { "StructActivite", (new Tables.rStruActi(), new Tables.rActi1()) },  //Activite
                    { "StructZone", (new Tables.rStruGeo(), new Tables.rGeo1()) },        //Zone
                    { "StructEmplacements", (new Tables.rStruEmplacement(), new Tables.rEmplacement()) },  //Emplacements
                    { "StructPlan6", (new Tables.rStruPlan6(), new Tables.rPlan6()) },  //Plan 6
                    
                    { "StructPlanExtP1", (new Tables.RSTRUPLAN1EXT(), new Tables.RPLAN1EXT()) },  //Plan 1
                    { "StructPlanExtP2", (new Tables.RSTRUPLAN2EXT(), new Tables.RPLAN2EXT()) },  //Plan 2
                    { "StructPlanExtP3", (new Tables.RSTRUPLAN3EXT(), new Tables.RPLAN3EXT()) },  //Plan 3
                    { "StructPlanExtP4", (new Tables.RSTRUPLAN4EXT(), new Tables.RPLAN4EXT()) },  //Plan 4
                    // Ajoute d'autres mappings ici si nécessaire
                };

            if (!tableMapping.TryGetValue(niveau, out var instances))
            {
                return Json(new { error = "ID non supporté" }, JsonRequestBehavior.AllowGet);
            }

            // Utilitaire pour remplir les DataTables via réflexion
            DataTable RemplirDataTable(object instance, string param = "")
            {
                if (instance == null) return new DataTable();

                var type = instance.GetType();
                var method = type.GetMethod("RemplirDataTable", new[] { typeof(string) });

                return method != null ? (DataTable)method.Invoke(instance, new object[] { param }) : new DataTable();
            }
            var nextNiveau = Convert.ToInt64(code1) - 1;
            filtre = $"NIVEAU = '{nextNiveau}'";
            // Remplissage des DataTables
            objNiveau2 = RemplirDataTable(instances.tablePostInstance, filtre);
            foreach (DataRow row in objNiveau2.Rows)
            {
                listNiveau2.Add(new parametre
                {
                    code = row["code"]?.ToString(),
                    libelle = row["Libelle"]?.ToString(),
                    niveau = row["niveau"]?.ToString(),
                });
            }
            if (code1 != null || code1 != "" || code1 != "0")
            {
                if (objNiveau2.Rows.Count > 0)
                {
                    DataRow firstRow_2_niveau = objNiveau2.Rows[0];
                    var FisrtCode = firstRow_2_niveau["CODE"].ToString();
                    if (string.IsNullOrEmpty(code2))
                    {
                        code2 = FisrtCode;
                    }
                    filtreTab = $"NIVEAU = '{code1}' and CODE like '{code2}%'";
                }
                else
                {
                    code2 = null;
                    filtreTab = $"NIVEAU = '{code1}'";
                }
                objTab = RemplirDataTable(instances.tablePostInstance, filtreTab);
                try
                {
                    switch (niveau)
                    {
                        case "StructPlanCompt":
                            foreach (DataRow row in objTab.Rows)
                            {
                                listtab.Add(new parametre
                                {
                                    code = row["code"]?.ToString(),
                                    libelle = row["Libelle"]?.ToString(),
                                    niveau = row["niveau"]?.ToString(),
                                    status = row["STATUT"]?.ToString(),
                                    collectif = row["collectif"].ToString(),
                                    gestionImmo = row["GESTIONIMMO"].ToString(),
                                    budget = row["budget"].ToString(),
                                    acti = row["acti"].ToString(),
                                    geo = row["geo"].ToString(),
                                    fin = row["fin"].ToString(),
                                    superClasse = row["superClasse"].ToString(),
                                });
                            }
                            break;
                        default:
                            foreach (DataRow row in objTab.Rows)
                            {
                                listtab.Add(new parametre
                                {
                                    code = row["code"]?.ToString(),
                                    libelle = row["Libelle"]?.ToString(),
                                    niveau = row["niveau"]?.ToString(),
                                    status = row["STATUT"]?.ToString(),
                                });
                            }
                            break;
                    }
                }
                catch (Exception ex)
                {

                    throw;
                }
            }
            var data = new
            {
                listniveau = listNiveau2,
                listData = listtab
            };
            return Json(data, JsonRequestBehavior.AllowGet);

        }

        public JsonResult GetListDataStruct(string id)
        {
            var listData = new List<parametre>();
            var filtre = string.Empty;
            DataTable objTab = new DataTable();
            DataTable objTab1 = new DataTable();
            int cpte = 0;

            // Mapping ID -> instances des tables
            var tableMapping = new Dictionary<string, (object tableInstance, object tablePostInstance)>
                {
                    { "StructPlanBudget", (new Tables.rStruPost(), new Tables.rPost1()) }, //Budget
                    { "StructPlanCompt", (new Tables.rStruCoge(), new Tables.rCoge1()) }, //Plan Compte
                    { "StructActivite", (new Tables.rStruActi(), new Tables.rActi1()) },  //Activite
                    { "StructZone", (new Tables.rStruGeo(), new Tables.rGeo1()) },        //Zone
                    { "StructEmplacements", (new Tables.rStruEmplacement(), new Tables.rEmplacement()) },  //Emplacements
                    { "StructPlan6", (new Tables.rStruPlan6(), new Tables.rPlan6()) },  //Plan 6
                    
                    { "StructPlanExtP1", (new Tables.RSTRUPLAN1EXT(), new Tables.RPLAN1EXT()) },  //Plan 1
                    { "StructPlanExtP2", (new Tables.RSTRUPLAN2EXT(), new Tables.RPLAN2EXT()) },  //Plan 2
                    { "StructPlanExtP3", (new Tables.RSTRUPLAN3EXT(), new Tables.RPLAN3EXT()) },  //Plan 3
                    { "StructPlanExtP4", (new Tables.RSTRUPLAN4EXT(), new Tables.RPLAN4EXT()) },  //Plan 4
                    // Ajoute d'autres mappings ici si nécessaire
                };

            if (!tableMapping.TryGetValue(id, out var instances))
            {
                return Json(new { error = "ID non supporté" }, JsonRequestBehavior.AllowGet);
            }

            // Utilitaire pour remplir les DataTables via réflexion
            DataTable RemplirDataTable(object instance, string param = "")
            {
                if (instance == null) return new DataTable();

                var type = instance.GetType();
                var method = type.GetMethod("RemplirDataTable", new[] { typeof(string) });

                return method != null ? (DataTable)method.Invoke(instance, new object[] { param }) : new DataTable();
            }

            // Remplissage des DataTables
            objTab = RemplirDataTable(instances.tableInstance, filtre);
            objTab1 = RemplirDataTable(instances.tablePostInstance, "");

            cpte = objTab1.Rows.Count;

            // Traitement des données selon l'ID
            switch (id)
            {
                case "StructPlanBudget":
                case "StructPlanCompt":
                case "StructActivite":
                case "StructZone":
                case "StructEmplacements":
                case "StructPlan6":
                    foreach (DataRow row in objTab.Rows)
                    {
                        listData.Add(new parametre
                        {
                            niveau = row["Niveau"]?.ToString(),
                            libelle = row["Libelle"]?.ToString(),
                            abreviation = row["Abreviation"]?.ToString(),
                            format = row["Format"]?.ToString(),
                            titre = row["Titre"]?.ToString(),
                            abreviationTitre = row["TitreCourt"]?.ToString()
                        });
                    }
                    break;
                case "StructPlanExtP1":
                case "StructPlanExtP2":
                case "StructPlanExtP3":
                case "StructPlanExtP4":
                    foreach (DataRow row in objTab.Rows)
                    {
                        listData.Add(new parametre
                        {
                            niveau = row["Niveau"]?.ToString(),
                            libelle = row["Libelle"]?.ToString(),
                            abreviation = row["Abreviation"]?.ToString(),
                            format = row["Format"]?.ToString(),
                            titre = row["Titre"]?.ToString(),
                            abreviationTitre = row["TitreCourt"]?.ToString(),
                            PlanCorrespond = row["rattachement"]?.ToString(),
                            
                        });
                    }
                    break;

                    // Ajoute d'autres cas si nécessaire
            }
            var listSuperClass = new List<parametre>();
            Tables.rSuperClasse rSuperClasse = new Tables.rSuperClasse();
            DataTable tabSupClass = rSuperClasse.RemplirDataTable();
            foreach (DataRow row in tabSupClass.Rows)
            {
                listSuperClass.Add(new parametre()
                {
                    code = row["code"].ToString(),
                    libelle = row["libelle"].ToString()
                });
            }
            // Structure de retour
            var data = new
            {
                total = cpte,
                listData,
                listSuperClass
            };

            return Json(data, JsonRequestBehavior.AllowGet);
        }

    }
}