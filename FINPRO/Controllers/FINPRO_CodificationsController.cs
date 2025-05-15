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
            // Mapping des niveaux vers les instances de classes concernées
            var tableMapping = new Dictionary<string, (object tablePlan, object tableRef, object tableCorrespondance)>
            {
                { "P1Activite-tab", (new Tables.RPLAN1EXT(), new Tables.rActi1(), new Tables.RCORPLAN1EXT()) },
                { "P2Zones-tab",    (new Tables.RPLAN2EXT(), new Tables.rGeo1(),  new Tables.RCORPLAN2EXT()) },
                { "P3Budget-tab",   (new Tables.RPLAN3EXT(), new Tables.rPost1(), new Tables.RCORPLAN3EXT()) },
                { "P4Compte-tab",   (new Tables.RPLAN4EXT(), new Tables.rCoge1(), new Tables.RCORPLAN4EXT()) },
            };

            if (!tableMapping.TryGetValue(niveau, out var instances))
            {
                return Json(new { error = "ID non supporté" }, JsonRequestBehavior.AllowGet);
            }

            // Méthode utilitaire pour appeler dynamiquement RemplirDataTable
            DataTable InvokeRemplirDataTable(object instance, string param = "")
            {
                var method = instance?.GetType().GetMethod("RemplirDataTable", new[] { typeof(string) });
                return method?.Invoke(instance, new object[] { param }) as DataTable ?? new DataTable();
            }

            // Méthode pour récupérer la table avec filtre sur le NIVEAU max
            DataTable GetFilteredTable(object instance)
            {
                string tableName = instance.GetType().Name;
                string filter = $"NIVEAU = (SELECT MAX(NIVEAU) FROM {tableName})";
                return InvokeRemplirDataTable(instance, filter);
            }

            // Conversion d’un DataTable vers List<parametre>
            List<parametre> ToParametreList(DataTable table)
            {
                return table.AsEnumerable()
                            .Select(row => new parametre
                            {
                                code = row["code"].ToString(),
                                libelle = row["libelle"].ToString()
                            })
                            .ToList();
            }
            List<parametre> ToParametreListTab(DataTable table)
            {
                return table.AsEnumerable()
                            .Select(row => new parametre
                            {
                                cle = row["NUMENREG"].ToString(),
                                code = row["code"].ToString(),
                                libelle = row["correspondance"].ToString()
                            })
                            .ToList();
            }

            // Récupération des trois sources de données
            var tabCode = GetFilteredTable(instances.tablePlan);
            var tabRef = GetFilteredTable(instances.tableRef);
            var tabAssigned = InvokeRemplirDataTable(instances.tableCorrespondance);

            // Construction de la réponse
            var result = new
            {
                listCode = ToParametreList(tabCode),
                listCoresspond = ToParametreList(tabRef),
                listData = ToParametreListTab(tabAssigned)
            };

            var jsonResult = Json(result, JsonRequestBehavior.AllowGet);
            jsonResult.MaxJsonLength = int.MaxValue;
            return jsonResult;
        }
        [HttpPost]
        public JsonResult CRUDPlanCompta(parametre objData)
        {
            string result = "";
            bool isAllValid = true;
            var niveau = objData.instance;
            var v = objData.cocherActif;
            bool statut = objData.statut;
            DataTable table = new DataTable();
            DataRow row;
            var extraFields = SetExtraFields(niveau, objData);
            var filtre = GetFiltre(objData);
            var tableInstance = GetTableInstance(niveau);
            // Vérification et enregistrement
            if (tableInstance != null)
            {
                var tableType = tableInstance.GetType();
                var remplirDataTableMethod = tableType.GetMethod("RemplirDataTable", new Type[] { typeof(string) });
                var enregistrerMethod = tableType.GetMethod("Enregistrer", new Type[] { typeof(DataTable) });
                if (remplirDataTableMethod != null)
                {

                    table = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { filtre });
                    switch (statut)
                    {
                        //Ajout
                        case false:
                            if (table.Rows.Count > 0)
                            {
                                isAllValid = false;
                            }
                            else
                            {
                                table = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { "" });
                                row = table.NewRow();
                                // Ajout des champs supplémentaires s'ils existent
                                if (extraFields != null)
                                {
                                    try
                                    {
                                        foreach (var field in extraFields)
                                        {
                                            row[field.Key] = field.Value;
                                        }
                                    }
                                    catch (Exception ex)
                                    {

                                        throw;
                                    }
                                }
                                table.Rows.Add(row);
                            }
                            break;
                        //Edition
                        default:
                            row = table.Rows[0];
                            row.BeginEdit();
                            foreach (var field in extraFields)
                            {
                                row[field.Key] = field.Value;
                            }
                            row.EndEdit();
                            break;
                    }
                    try
                    {
                        if (isAllValid)
                        {
                            // Enregistrer si la méthode existe
                            enregistrerMethod?.Invoke(tableInstance, new object[] { table });
                        }
                        result = statut ? "Enregistrement modifié avec succès" : (isAllValid ? "Enregistrement ajouté avec succès" : "Code existe déjà");
                    }
                    catch (Exception ex)
                    {
                        result = ex.Message;
                    }
                }
            }

            return Json(new { statut = isAllValid, message = result }, JsonRequestBehavior.AllowGet);
        }
        private object GetTableInstance(string niveau)
        {
            var tableMappings = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase)
            {
                { "StructPlanBudget", (new Tables.rPost1()) },
                { "StructPlanCompt", (new Tables.rCoge1()) },
                { "StructActivite", (new Tables.rActi1()) },
                { "StructZone", (new Tables.rGeo1()) },
                { "StructEmplacements", (new Tables.rEmplacement()) },
                { "StructPlan6", (new Tables.rPlan6()) },
                { "StructPlanExtP1", (new Tables.RPLAN1EXT()) },
                { "StructPlanExtP2", (new Tables.RPLAN2EXT()) },
                { "StructPlanExtP3", (new Tables.RPLAN3EXT()) },
                { "StructPlanExtP4", (new Tables.RPLAN4EXT()) },
                { "StructSousCategorie", (new Tables.rSousCategorie()) }
            };
            if (tableMappings.TryGetValue(niveau, out var instance))
            {
                return instance;
            }

            // No mapping found
            return null;
        }
        private string GetFiltre(parametre objData)
        {
            string niveau = objData.instance;
            Func<parametre, string> codeFilter = param => $"CODE = '{param.code}'";

            var filterTypeMapping = new Dictionary<string, Func<parametre, string>>(StringComparer.OrdinalIgnoreCase)
            {
                { "StructPlanBudget", codeFilter },
                { "StructPlanCompt", codeFilter },
                { "StructActivite", codeFilter },
                { "StructZone", codeFilter },
                { "StructEmplacements", codeFilter },
                { "StructPlan6", codeFilter },
                { "StructPlanExtP1", codeFilter },
                { "StructPlanExtP2", codeFilter },
                { "StructPlanExtP3", codeFilter },
                { "StructPlanExtP4", codeFilter },

            };

            if (filterTypeMapping.TryGetValue(niveau, out var filterFunc))
            {
                return filterFunc(objData);
            }

            // Default case (no matching niveau found)
            return "";
        }
        private Dictionary<string, object> SetExtraFields(string niveau, parametre objData)
        {
            // Define common field mappings
            var standardFields = new Dictionary<string, Func<parametre, object>>
            {
                { "code", param => param.code },
                { "libelle", param => param.libelle },
                { "niveau", param => param.niveau },
                { "statut", param => Convert.ToInt32(param.cocherActif) },
            };

            //var caisseFields = new Dictionary<string, Func<parametre, object>>
            //{
            //    { "code", param => param.code },
            //    { "libelle", param => param.Designation }
            //};

            //var tabBordFields = new Dictionary<string, Func<parametre, object>>(standardFields)
            //{
            //    { "observation", param => param.observation }
            //};

            var sharedStandardMapping = new Dictionary<string, Func<parametre, object>>(standardFields)
            {
                 { "SUIVIQTE", param => 1 }
            };
            var sharedFamilyPlan = new Dictionary<string, Func<parametre, object>>(standardFields);

            var fieldMappings = new Dictionary<string, Dictionary<string, Func<parametre, object>>>(StringComparer.OrdinalIgnoreCase);

            string[] standardTypes = 
                { 
                    "StructPlanBudget", "StructActivite",
                    "StructZone", "StructPlan6"                    
                };

            foreach (var type in standardTypes)
            {
                fieldMappings[type] = sharedStandardMapping;
            }
            string[] FamilyPlanType =
            {
                "StructEmplacements","StructPlanExtP1", "StructPlanExtP2", "StructPlanExtP3", "StructPlanExtP4"
            };
            foreach (var type in FamilyPlanType)
            {
                fieldMappings[type] = sharedFamilyPlan;
            }
            //fieldMappings["Caisse"] = caisseFields;
            //fieldMappings["TabBord"] = tabBordFields;

            var fields = new Dictionary<string, object>();

            if (fieldMappings.TryGetValue(niveau, out var fieldMapping))
            {
                // Apply each field mapping
                foreach (var field in fieldMapping)
                {
                    fields[field.Key] = field.Value(objData);
                }
            }

            return fields;
        }
        public JsonResult GetListDataNiveau2(string niveau, string code1, string code2)
        {
            var listNiveau2 = new List<parametre>();
            var listtab = new List<parametre>();
            DataTable objNiveau2 = new DataTable();
            DataTable objTab = new DataTable();

            var tableMapping = new Dictionary<string, (object tableInstance, object tablePostInstance)>
            {
                { "StructPlanBudget", (new Tables.rStruPost(), new Tables.rPost1()) },
                { "StructPlanCompt", (new Tables.rStruCoge(), new Tables.rCoge1()) },
                { "StructActivite", (new Tables.rStruActi(), new Tables.rActi1()) },
                { "StructZone", (new Tables.rStruGeo(), new Tables.rGeo1()) },
                { "StructEmplacements", (new Tables.rStruEmplacement(), new Tables.rEmplacement()) },
                { "StructPlan6", (new Tables.rStruPlan6(), new Tables.rPlan6()) },
                { "StructPlanExtP1", (new Tables.RSTRUPLAN1EXT(), new Tables.RPLAN1EXT()) },
                { "StructPlanExtP2", (new Tables.RSTRUPLAN2EXT(), new Tables.RPLAN2EXT()) },
                { "StructPlanExtP3", (new Tables.RSTRUPLAN3EXT(), new Tables.RPLAN3EXT()) },
                { "StructPlanExtP4", (new Tables.RSTRUPLAN4EXT(), new Tables.RPLAN4EXT()) },
                { "StructSousCategorie", (new Tables.rCategorie(), new Tables.rSousCategorie()) },
            };

            if (!tableMapping.TryGetValue(niveau, out var instances))
                return Json(new { error = "ID non supporté" }, JsonRequestBehavior.AllowGet);

            DataTable RemplirDataTable(object instance, string filtre = "")
            {
                var method = instance.GetType().GetMethod("RemplirDataTable", new[] { typeof(string) });
                return method?.Invoke(instance, new object[] { filtre }) as DataTable ?? new DataTable();
            }

            // Gestion du cas StructSousCategorie
            if (niveau == "StructSousCategorie")
            {
                var filtre = $"CONVENTION = '{code1}'";
                objNiveau2 = RemplirDataTable(instances.tableInstance, filtre);

                listNiveau2 = objNiveau2.AsEnumerable().Select(row => new parametre
                {
                    code = row["code"]?.ToString(),
                    libelle = row["Libelle"]?.ToString()
                }).ToList();

                if (!string.IsNullOrWhiteSpace(code1) && objNiveau2.Rows.Count > 0)
                {
                    var firstCode = objNiveau2.Rows[0]["CODE"].ToString();
                    if (string.IsNullOrEmpty(code2))
                        code2 = firstCode;

                    var filtreTab = $"CONVENTION = '{code1}' and CATEGORIE = '{code2}'";
                    objTab = RemplirDataTable(instances.tablePostInstance, filtreTab);

                    listtab = objTab.AsEnumerable().Select(row => new parametre
                    {
                        convention = row["convention"]?.ToString(),
                        categorie = row["categorie"]?.ToString(),
                        code = row["code"]?.ToString(),
                        libelle = row["libelle"]?.ToString(),
                        status = row["statut"]?.ToString()
                    }).ToList();
                }
            }
            else
            {
                var prevNiveau = Convert.ToInt64(code1) - 1;
                var filtre = $"NIVEAU = '{prevNiveau}'";
                objNiveau2 = RemplirDataTable(instances.tablePostInstance, filtre);

                listNiveau2 = objNiveau2.AsEnumerable().Select(row => new parametre
                {
                    code = row["code"]?.ToString(),
                    libelle = row["Libelle"]?.ToString(),
                    niveau = row["niveau"]?.ToString()
                }).ToList();

                if (!string.IsNullOrWhiteSpace(code1))
                {
                    string filtreTab;
                    if (objNiveau2.Rows.Count > 0)
                    {
                        var firstCode = objNiveau2.Rows[0]["CODE"].ToString();
                        if (string.IsNullOrEmpty(code2))
                            code2 = firstCode;

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
                        listtab = objTab.AsEnumerable().Select(row => new parametre
                        {
                            code = row["code"]?.ToString(),
                            libelle = row["Libelle"]?.ToString(),
                            niveau = row["niveau"]?.ToString(),
                            status = row["STATUT"]?.ToString(),
                            collectif = niveau == "StructPlanCompt" ? row["collectif"]?.ToString() : null,
                            gestionImmo = niveau == "StructPlanCompt" ? row["GESTIONIMMO"]?.ToString() : null,
                            budget = niveau == "StructPlanCompt" ? row["budget"]?.ToString() : null,
                            acti = niveau == "StructPlanCompt" ? row["acti"]?.ToString() : null,
                            geo = niveau == "StructPlanCompt" ? row["geo"]?.ToString() : null,
                            fin = niveau == "StructPlanCompt" ? row["fin"]?.ToString() : null,
                            superClasse = niveau == "StructPlanCompt" ? row["superClasse"]?.ToString() : null
                        }).ToList();
                    }
                    catch (Exception ex)
                    {
                        // Log ex if needed
                        throw;
                    }
                }
            }

            return Json(new
            {
                listniveau = listNiveau2,
                listData = listtab
            }, JsonRequestBehavior.AllowGet);
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
                    { "StructSousCategorie", (new Tables.rConvention(), new Tables.rCategorie()) },  //Sous Categorie
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
                case "StructSousCategorie":
                    foreach (DataRow row in objTab.Rows)
                    {
                        listData.Add(new parametre
                        {
                            code = row["code"]?.ToString(),
                            libelle = row["Libelle"]?.ToString(),
                        });
                    }
                    break;
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