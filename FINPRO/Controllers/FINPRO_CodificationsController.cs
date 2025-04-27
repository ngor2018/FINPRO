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
                ViewBag.Projet = "FINPRONET";
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

            var data = new
            {
                budget = GetTitreCourt(rStruBudget.RemplirDataTable(), "Budget"),
                PlanCompte = "Plan comptable", // Fixe
                activite = GetTitreCourt(rStruActivite.RemplirDataTable(), "Activité"),
                zones = GetTitreCourt(rStruZone.RemplirDataTable(), "Géo"),
                emplacement = "Emplacements", // Fixe
                p1 = GetTitreCourt(rStruP1.RemplirDataTable(), "Plan 1"),
                p2 = GetTitreCourt(rStruP2.RemplirDataTable(), "Plan 2"),
                p3 = GetTitreCourt(rStruP3.RemplirDataTable(), "Plan 3"),
                p4 = GetTitreCourt(rStruP4.RemplirDataTable(), "Plan 4"),
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

            // Structure de retour
            var data = new
            {
                total = cpte,
                listData
            };

            return Json(data, JsonRequestBehavior.AllowGet);
        }

    }
}