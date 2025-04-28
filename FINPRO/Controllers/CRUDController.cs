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
using System.Globalization;

namespace FINPRO.Controllers
{
    public class CRUDController : Controller
    {
        // GET: CRUD
        SqlCommand com = new SqlCommand();
        SqlDataReader dr;
        SqlConnection conn = new SqlConnection(GetConnexion.GetConnectionString());
        parametre parametre = new parametre();

        [HttpGet]
        public JsonResult GetDataDetailParamBPi(string page,string code)
        {
            List<parametre> listB = new List<parametre>();
            List<parametre> listP = new List<parametre>();
            DataTable objTableB = new DataTable();
            DataTable objTableP = new DataTable();
            object tableInstance = null;
            string filtreB = "",filtreP="";
            switch (page)
            {
                case "Monnaie":
                    filtreB = $"MONNAIE = '{code}' and TYPE = 'B'";
                    filtreP = $"MONNAIE = '{code}' and TYPE = 'P'";
                    tableInstance = new Tables.MMONNAIE();
                    break;
            }
            if (tableInstance != null)
            {
                var tableType = tableInstance.GetType();
                var remplirDataTableMethod = tableType.GetMethod("RemplirDataTable", new Type[] { typeof(string) });
                if (remplirDataTableMethod != null)
                {
                    objTableB = ((DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { filtreB })).Copy();
                    objTableP = ((DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { filtreP })).Copy();
                }
            }
            int rowIndexB = 1;
            int rowIndexP = 1;
            foreach (DataRow row in objTableB.Rows)
            {
                listB.Add(new parametre()
                {
                    rowIndexB = rowIndexB,
                    code = row["NUMENREG"].ToString(),
                    valeur = Math.Floor(Convert.ToDecimal(row["VALEUR"])).ToString()
                });
                rowIndexB++;
            }
            foreach (DataRow row in objTableP.Rows)
            {
                listP.Add(new parametre()
                {
                    rowIndexP = rowIndexP,
                    code = row["NUMENREG"].ToString(),
                    valeur = Math.Floor(Convert.ToDecimal(row["VALEUR"])).ToString()
                });
                rowIndexP++;
            }
            var dataList = new
            {
                Billet = listB,
                Piece = listP
            };
            return Json(dataList, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult GetCheckMouvArticle(string code,string code1,string code2,string article)
        {
            var isAllValid = true;
            string filtre = "", result = "";
            DataTable objTab = new DataTable();
            switch (code)
            {
                case "Affectations":
                    filtre = $"SITE = '{code1}' and MAGASIN = '{code2}' and ARTICLE = '{article}'";
                    Tables_Sto.mMouvement mMouvement = new Tables_Sto.mMouvement();
                    objTab = mMouvement.RemplirDataTable(filtre);
                    if (objTab.Rows.Count > 0)
                    {
                        isAllValid = false;
                    }
                    break;
            }
            if (!isAllValid)
            {
                result = "Cet article est déjà mouvementé. Seuls les stocks mini et maxi sont modifiables";
            }
            return Json(new { statut = isAllValid, message = result }, JsonRequestBehavior.AllowGet);
        }
        [HttpGet]
        public JsonResult GetSerieArticle(string code, string code1, string code2)
        {
            Tables_Sto.rStkArticle article = new Tables_Sto.rStkArticle();
            DataTable objTab = new DataTable();
            var filtre = "";
            switch (code)
            {
                case "Articles":
                    filtre = $"GROUPE = '{code1}' and FAMILLE = '{code2}'";
                    break;
            }
            try
            {
                objTab = article.RemplirDataTable(filtre);
                Int32 codeLast = 0;
                if (objTab.Rows.Count > 0)
                {
                    DataRow lastRow = objTab.Rows[objTab.Rows.Count - 1];
                    codeLast = Convert.ToInt32(lastRow["SERIE"]) + 1;
                    return Json(new { code = codeLast }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { code = codeLast, message = "Aucune ligne trouvée." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { error = true, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        

        [HttpGet]
        public JsonResult GetEntreeSortie(string page,string compte)
        {
            List<parametre> listExercice = new List<parametre>();
            List<parametre> listCompte = new List<parametre>();
            List<parametre> listCompteAuxi = new List<parametre>();
            Tables_Sto.rExercice rExercice = new Tables_Sto.rExercice();
            DataTable tabExo = rExercice.RemplirDataTable();
            foreach (DataRow row in tabExo.Rows)
            {
                listExercice.Add(new parametre()
                {
                    annee = row["annee"].ToString(),
                    statut = bool.Parse(row["ENCOURS"].ToString()),
                    dateDebut = DateTime.Parse(row["DATEDEB"].ToString()).ToString("dd/MM/yyyy"),
                    dateFin = DateTime.Parse(row["DATEFIN"].ToString()).ToString("dd/MM/yyyy")
                });
            }
            var filtre = "";
            switch (page)
            {
                case "EntreeStock":
                    Tables.rCoge1 rCoge1 = new Tables.rCoge1();
                    DataTable tabCoge = rCoge1.RemplirDataTable($"COLLECTIF = '1'");
                    foreach (DataRow row in tabCoge.Rows)
                    {
                        listCompte.Add(new parametre()
                        {
                            code = row["code"].ToString(),
                            libelle = row["libelle"].ToString()
                        });
                    }
                    if (tabCoge.Rows.Count > 0)
                    {
                        DataRow firstRowS = tabCoge.Rows[0];
                        var codeFirstS = firstRowS["CODE"].ToString();

                        if (string.IsNullOrEmpty(compte))
                        {
                            compte = codeFirstS;
                        }
                        var filtreTiers = $"COGE = '{compte}'";
                        Tables.rTiers rTiers = new Tables.rTiers();
                        DataTable tabTiers = rTiers.RemplirDataTable(filtreTiers);
                        foreach (DataRow row in tabTiers.Rows)
                        {
                            listCompteAuxi.Add(new parametre()
                            {
                                code = row["AUXI"].ToString(),
                                libelle = row["NOM"].ToString()
                            });
                        }
                    }
                    break;
            }
            var listData = new
            {
                exercice = listExercice,
                compte = listCompte,
                compteAuxi = listCompteAuxi
            };
            return Json(listData, JsonRequestBehavior.AllowGet);
        }
        [HttpGet]
        public JsonResult GetAffectArticle(string code, string code1, string code2)
        {
            List<parametre> list1 = new List<parametre>();
            List<parametre> list2 = new List<parametre>();
            List<parametre> listArticleFilterAffect = new List<parametre>();
            object tableInstance = null;
            var filtre = "";
            DataTable objTable = new DataTable();
            switch (code)
            {
                case "Affectations":
                    tableInstance = new Tables_Sto.mAffectation();
                    break;
            }
            if (tableInstance != null)
            {
                var tableType = tableInstance.GetType();
                var remplirDataTableMethod = tableType.GetMethod("RemplirDataTable", new Type[] { typeof(string) });
                if (remplirDataTableMethod != null)
                {
                    objTable = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { "" });
                }
            }
            switch (code)
            {
                case "Affectations":
                    Tables_Sto.rGroupeFamille rGroup = new Tables_Sto.rGroupeFamille();
                    DataTable tabGr = rGroup.RemplirDataTable();

                    foreach (DataRow row in tabGr.Rows)
                    {
                        list1.Add(new parametre()
                        {
                            code = row["code"].ToString(),
                            libelle = row["libelle"].ToString()
                        });
                    }
                    if (tabGr.Rows.Count > 0)
                    {
                        DataRow firstRowGr = tabGr.Rows[0];
                        var FisrtCodeGr = firstRowGr["CODE"].ToString();
                        if (string.IsNullOrEmpty(code1))
                        {
                            code1 = FisrtCodeGr;
                        }
                        var filtreFam = $"GROUPE = '{code1}'";
                        Tables_Sto.rFamille rFamille = new Tables_Sto.rFamille();
                        DataTable tabFam = rFamille.RemplirDataTable(filtreFam);
                        foreach (DataRow row in tabFam.Rows)
                        {
                            list2.Add(new parametre()
                            {
                                code = row["code"].ToString(),
                                libelle = row["libelle"].ToString()
                            });
                        }
                        if (tabFam.Rows.Count > 0)
                        {
                            DataRow firstRowFam = tabFam.Rows[0];
                            var FisrtCodeFam = firstRowFam["CODE"].ToString();
                            if (string.IsNullOrEmpty(code2))
                            {
                                code2 = FisrtCodeFam;
                            }
                            filtre = $"GROUPE = '{code1}' and FAMILLE = '{code2}'";
                        }
                        else
                        {
                            filtre = $"GROUPE = '{code1}'";
                        }
                        //DataRow[] rowsFiltersAr = objTable.Select(filtre);
                        //objTable = rowsFiltersAr.Length > 0 ? rowsFiltersAr.CopyToDataTable() : objTable.Clone();
                        
                        
                        Tables_Sto.rStkArticle rArticle = new Tables_Sto.rStkArticle();
                        Tables_Sto.mAffectation mAffectation = new Tables_Sto.mAffectation();
                        DataTable tabArticle = rArticle.RemplirDataTable(filtre);
                        DataTable tabAffect = mAffectation.RemplirDataTable();

                        var affectCodes = tabAffect.AsEnumerable()
                               .Select(r => r["ARTICLE"].ToString())
                               .ToHashSet(); // Optimisé pour la recherche

                        var articlesNonAffectes = tabArticle.AsEnumerable()
                            .Where(r => !affectCodes.Contains(r["CODE"].ToString()))
                            .Select(r => new parametre
                            {
                                code = r["CODE"].ToString(),
                                libelle = r["LIBELLE"].ToString()
                            })
                            .ToList();

                        listArticleFilterAffect.AddRange(articlesNonAffectes);
                    }
                    break;
            }
            var listData = new
            {
                list1 = list1,
                list2 = list2,
                listArticle = listArticleFilterAffect
            };
            return Json(listData, JsonRequestBehavior.AllowGet);
        }
        [HttpGet]
        public JsonResult GetSiteMagasin(string code1)
        {
            List<parametre> listSite = new List<parametre>();
            List<parametre> listSite2 = new List<parametre>();

            Tables.rSite rSite = new Tables.rSite();
            DataTable tabSite = rSite.RemplirDataTable(Tables.rSite.GetChamp.EnCours.ToString() + " = 1");
            foreach (DataRow row in tabSite.Rows)
            {
                listSite.Add(new parametre()
                {
                    code = row["code"].ToString(),
                    libelle = row["libelle"].ToString()
                });
            }
            if (tabSite.Rows.Count > 0)
            {
                DataRow firstRowS = tabSite.Rows[0];
                var codeFirstS = firstRowS["CODE"].ToString();

                if (string.IsNullOrEmpty(code1))
                {
                    code1 = codeFirstS;
                }

                var filtreMag = $"SITE = '{code1}'";
                Tables_Sto.rMagasin rMagasin = new Tables_Sto.rMagasin();
                DataTable tabMag = rMagasin.RemplirDataTable(filtreMag);
                foreach (DataRow row in tabMag.Rows)
                {
                    listSite2.Add(new parametre()
                    {
                        code = row["code"].ToString(),
                        libelle = row["libelle"].ToString()
                    });
                }
            }
            var list = new
            {
                list1 = listSite,
                list2 = listSite2,

            };
            return Json(list, JsonRequestBehavior.AllowGet);
        }
        [HttpGet]
        public JsonResult GetDataArticleInsertStock(string code1,string code2,string codeBar)
        {
            List<parametre> listArticle = new List<parametre>();
            Tables_Sto.mAffectation mAffectation = new Tables_Sto.mAffectation();
            var filtre = "";
            filtre = $"SITE = '{code1}' and MAGASIN = '{code2}'";
            //DataTable objTable = mAffectation.RemplirDataTable(filtre);
            //BDD.Divers objBDDDiver = new BDD.Divers();
            //string articleCode;
            //string filtreArt;
            DataTable objTable = new DataTable();
            string requete = "";
            if (codeBar == null || codeBar == "")
            {
                requete = "select CODE,LIBELLE,aff.PRIXUNITAIRE as PRIXUNITAIRE from RSTKARTICLE art,MAFFECTATION aff where art.CODE = aff.ARTICLE and aff.SITE='" + code1 + "' and aff.MAGASIN='" + code2 + "'";
            }
            else {
                requete = "select CODE,LIBELLE,aff.PRIXUNITAIRE as PRIXUNITAIRE from RSTKARTICLE art,MAFFECTATION aff where art.CODE = aff.ARTICLE and aff.SITE='" + code1 + "' and aff.MAGASIN='" + code2 + "' and art.CodeBarre = '" + codeBar + "'";
            }
            conn.Open();
            com.Connection = conn;
            com.CommandText = requete;
            dr = com.ExecuteReader();
            objTable.Load(dr);
            foreach (DataRow row1 in objTable.Rows)
            {
                //filtreArt = $"CODE = '{row1["ARTICLE"].ToString()}'";
                //var libelle = objBDDDiver.GetLibelle(filtreArt, Abstraite.enumPlan.ARTICLESTOCK, Tables_Sto.rStkArticle.GetChamp.Libelle.ToString());
                listArticle.Add(new parametre()
                {
                    code = row1["CODE"].ToString(),
                    libelle = row1["LIBELLE"].ToString(),
                    prixUnitaire = row1["PRIXUNITAIRE"].ToString()
                });
            }
            return new JsonResult
            {
                Data = listArticle,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet,
                MaxJsonLength = int.MaxValue // ✅ Ici tu autorises un JSON très grand
            };
        }



        [HttpGet]
        public JsonResult GetDataParam(string code, string code1,string code2)
        {
            List<parametre> listDataFiltre = new List<parametre>();
            List<parametre> listParamMaxLengthCode = new List<parametre>();
            List<parametre> listSite = new List<parametre>();
            List<parametre> listSite2 = new List<parametre>();
            List<parametre> listUnite = new List<parametre>();
            DataTable objTabFiltre = new DataTable();
            DataTable objTable = new DataTable();
            DataTable objTabCodeMaxLength = new DataTable();
            object tableInstance = null;
            switch (code)
            {
                case "Pays":
                    tableInstance = new Tables.rPays();
                    break;
                case "services":
                    tableInstance = new Tables_Sto.rService();
                    break;
                case "groupes":
                    tableInstance = new Tables_Sto.rGroupeFamille();
                    break;
                case "unites":
                    tableInstance = new Tables.rUnite();
                    break;
                case "magasins":
                    tableInstance = new Tables_Sto.rMagasin();
                    break;
                case "Exercices":
                    tableInstance = new Tables.rExercice();
                    break;
                case "Monnaie":
                    tableInstance = new Tables.rMonnaie();
                    break;
                case "Structures":
                    tableInstance = new Tables_Sto.rStructure();
                    break;
                case "Articles":
                    tableInstance = new Tables_Sto.rStkArticle();
                    break;
                case "Affectations":
                    tableInstance = new Tables_Sto.mAffectation();
                    break;
            }
            if (tableInstance != null)
            {
                var tableType = tableInstance.GetType();
                var remplirDataTableMethod = tableType.GetMethod("RemplirDataTable", new Type[] { typeof(string) });
                if (remplirDataTableMethod != null)
                {
                    objTable = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { "" });
                }
            }
            var filtre = "";
            Tables.rSite rSite = new Tables.rSite();
            DataTable tabSite = rSite.RemplirDataTable(Tables.rSite.GetChamp.EnCours.ToString() + " = 1");
            switch (code)
            {
                case "magasins":
                    foreach (DataRow row in tabSite.Rows)
                    {
                        listSite.Add(new parametre()
                        {
                            code = row["code"].ToString(),
                            libelle = row["libelle"].ToString()
                        });
                    }

                    if (tabSite.Rows.Count > 0)
                    {
                        DataRow firstRowS = tabSite.Rows[0];
                        var codeFirstS = firstRowS["CODE"].ToString();

                        if (string.IsNullOrEmpty(code1))
                        {
                            code1 = codeFirstS;
                        }

                        filtre = $"SITE = '{code1}'";
                        DataRow[] rowsFilters = objTable.Select(filtre);
                        objTable = rowsFilters.Length > 0 ? rowsFilters.CopyToDataTable() : objTable.Clone();
                    }
                    break;
                case "Affectations":
                    Tables_Sto.rStkArticle rArticle = new Tables_Sto.rStkArticle();
                    DataTable tabArticle = rArticle.RemplirDataTable();
                    foreach (DataRow row1 in tabArticle.Rows)
                    {
                        listUnite.Add(new parametre()
                        {
                            code = row1["code"].ToString(),
                            libelle = row1["libelle"].ToString(),
                            prixUnitaire = row1["PU"].ToString()
                        });
                    }

                    foreach (DataRow row in tabSite.Rows)
                    {
                        listSite.Add(new parametre()
                        {
                            code = row["code"].ToString(),
                            libelle = row["libelle"].ToString()
                        });
                    }
                    if (tabSite.Rows.Count > 0)
                    {
                        DataRow firstRowS = tabSite.Rows[0];
                        var codeFirstS = firstRowS["CODE"].ToString();

                        if (string.IsNullOrEmpty(code1))
                        {
                            code1 = codeFirstS;
                        }

                        var filtreMag = $"SITE = '{code1}'";
                        Tables_Sto.rMagasin rMagasin = new Tables_Sto.rMagasin();
                        DataTable tabMag = rMagasin.RemplirDataTable(filtreMag);
                        foreach (DataRow row in tabMag.Rows)
                        {
                            listSite2.Add(new parametre()
                            {
                                code = row["code"].ToString(),
                                libelle = row["libelle"].ToString()
                            });
                        }
                        if (tabMag.Rows.Count > 0)
                        {
                            DataRow firstRowMag = tabMag.Rows[0];
                            var FisrtCodeMag = firstRowMag["CODE"].ToString();
                            if (string.IsNullOrEmpty(code2))
                            {
                                code2 = FisrtCodeMag;
                            }
                            filtre = $"SITE = '{code1}' and MAGASIN = '{code2}'";
                        }
                        else
                        {
                            filtre = $"SITE = '{code1}'";
                        }
                        DataRow[] rowsFiltersAr = objTable.Select(filtre);
                        objTable = rowsFiltersAr.Length > 0 ? rowsFiltersAr.CopyToDataTable() : objTable.Clone();
                    }
                    break;
                case "Articles":
                    Tables_Sto.rGroupeFamille rGroup = new Tables_Sto.rGroupeFamille();
                    DataTable tabGr = rGroup.RemplirDataTable();

                    foreach (DataRow row in tabGr.Rows)
                    {
                        listSite.Add(new parametre()
                        {
                            code = row["code"].ToString(),
                            libelle = row["libelle"].ToString()
                        });
                    }
                    Tables_Sto.rUnite rUnite = new Tables_Sto.rUnite();
                    DataTable tabUnite = rUnite.RemplirDataTable();
                    foreach (DataRow row1 in tabUnite.Rows)
                    {
                        listUnite.Add(new parametre()
                        {
                            code = row1["code"].ToString(),
                            libelle = row1["libelle"].ToString()
                        });
                    }
                    if (tabGr.Rows.Count > 0)
                    {
                        DataRow firstRowGr = tabGr.Rows[0];
                        var FisrtCodeGr = firstRowGr["CODE"].ToString();
                        if (string.IsNullOrEmpty(code1))
                        {
                            code1 = FisrtCodeGr;
                        }
                        var filtreFam = $"GROUPE = '{code1}'";
                        Tables_Sto.rFamille rFamille = new Tables_Sto.rFamille();
                        DataTable tabFam = rFamille.RemplirDataTable(filtreFam);
                        foreach (DataRow row in tabFam.Rows)
                        {
                            listSite2.Add(new parametre()
                            {
                                code = row["code"].ToString(),
                                libelle = row["libelle"].ToString()
                            });
                        }
                        if (tabFam.Rows.Count > 0)
                        {
                            DataRow firstRowFam = tabFam.Rows[0];
                            var FisrtCodeFam = firstRowFam["CODE"].ToString();
                            if (string.IsNullOrEmpty(code2))
                            {
                                code2 = FisrtCodeFam;
                            }
                            filtre = $"GROUPE = '{code1}' and FAMILLE = '{code2}'";
                        }
                        else
                        {
                            filtre = $"GROUPE = '{code1}'";
                        }
                        DataRow[] rowsFiltersAr = objTable.Select(filtre);
                        objTable = rowsFiltersAr.Length > 0 ? rowsFiltersAr.CopyToDataTable() : objTable.Clone();
                    }
                    break;
            }

            // Remplissage de la liste
            switch (code)
            {
                case "Pays":
                case "signataire":
                case "groupes":
                case "services":
                case "unites":
                case "magasins":
                    foreach (DataRow row in objTable.Rows)
                    {
                        listDataFiltre.Add(new parametre()
                        {
                            code = row["code"].ToString(),
                            libelle = row["libelle"].ToString(),
                        });
                    }
                    break;
                case "Exercices":
                    foreach (DataRow row in objTable.Rows)
                    {
                        var dateCloture = row["DATECLOTURE"] == DBNull.Value || string.IsNullOrWhiteSpace(row["DATECLOTURE"].ToString())
                                            ? null
                                            : DateTime.Parse(row["DATECLOTURE"].ToString()).ToString("dd/MM/yyyy");
                        listDataFiltre.Add(new parametre()
                        {
                            annee = row["ANNEE"].ToString(),
                            dateDebut = DateTime.Parse(row["DATEDEB"].ToString()).ToString("dd/MM/yyyy"),
                            dateFin = DateTime.Parse(row["DATEFIN"].ToString()).ToString("dd/MM/yyyy"),
                            dateCloture = dateCloture,
                            statut = bool.Parse(row["ENCOURS"].ToString())
                        });
                    }
                    break;
                case "Monnaie":
                    foreach (DataRow row in objTable.Rows)
                    {
                        listDataFiltre.Add(new parametre()
                        {
                            code = row["code"].ToString(),
                            libelle = row["libelle"].ToString(),
                            libelleM = row["NOMDECIMALE"].ToString(),
                            nbreDecimale = row["NBDECIMALE"].ToString()
                        });
                    }
                    break;
                case "Structures":
                    if (objTable.Rows.Count > 0)
                    {
                        var row = objTable.Rows[0];
                        listDataFiltre.Add(new parametre()
                        {
                            pmp = (bool)row["PMP"],
                            magasin = row["MAGASIN"].ToString(),
                            groupe = row["GROUPE"].ToString(),
                            famille = row["FAMILLE"].ToString(),
                            service = row["SERVICE"].ToString(),
                            consommateur = row["CONSOMMATEUR"].ToString(),
                            unite = row["UNITE"].ToString(),
                            monnaie = row["MONNAIE"].ToString(),
                            pays = row["PAYS"].ToString(),
                            serie = row["SERIE"].ToString(),
                            serieAUTO = (bool)row["SERIEAUTO"],
                            codifArticle = row["CODIFARTICLE"].ToString()
                        });
                    }
                    break;
                case "Articles":
                    foreach (DataRow row in objTable.Rows)
                    {
                        listDataFiltre.Add(new parametre()
                        {
                            code = row["CODE"].ToString(),
                            libelle = row["LIBELLE"].ToString(),
                            groupe = row["GROUPE"].ToString(),
                            famille = row["FAMILLE"].ToString(),
                            serie = row["SERIE"].ToString(),
                            reference = row["REFERENCE"].ToString(),
                            unite = row["UNITE"].ToString(),
                            prixUnitaire = row["PU"].ToString(),
                            observation = row["OBSERVATION"].ToString(),
                            codeBarre = row["CodeBarre"].ToString()
                        });
                    }
                    break;
                case "Affectations":
                    foreach (DataRow row in objTable.Rows)
                    {
                        var filtreArt = $"CODE = '{row["ARTICLE"].ToString()}'";
                        BDD.Divers objBDDDiver = new BDD.Divers();
                        var libelleProd = objBDDDiver.GetLibelle(filtreArt, Abstraite.enumPlan.ARTICLESTOCK, Tables_Sto.rStkArticle.GetChamp.Libelle.ToString());
                        listDataFiltre.Add(new parametre()
                        {
                            site = row["SITE"].ToString(),
                            magasin = row["MAGASIN"].ToString(),
                            code = row["ARTICLE"].ToString(),
                            libelle = libelleProd,
                            stockMin = row["STOCKMIN"].ToString(),
                            stockMax = row["STOCKMAX"].ToString(),
                            QteInitiale = row["QUANTITEINITIALE"].ToString(),
                            prixUnitaire = row["PRIXUNITAIRE"].ToString(),
                            lastPrice = row["DERNIERPRIX"].ToString(),
                            valInitiale = row["VALEURINITIALE"].ToString(),
                        });
                    }
                    break;
            }
            Tables_Sto.rStructure rStructure = new Tables_Sto.rStructure();
            objTabCodeMaxLength = rStructure.RemplirDataTable();
            if (objTabCodeMaxLength.Rows.Count > 0)
            {
                var row = objTabCodeMaxLength.Rows[0];
                listParamMaxLengthCode.Add(new parametre()
                {
                    pmp = (bool)row["PMP"],
                    magasin = row["MAGASIN"].ToString(),
                    groupe = row["GROUPE"].ToString(),
                    famille = row["FAMILLE"].ToString(),
                    service = row["SERVICE"].ToString(),
                    consommateur = row["CONSOMMATEUR"].ToString(),
                    unite = row["UNITE"].ToString(),
                    monnaie = row["MONNAIE"].ToString(),
                    pays = row["PAYS"].ToString(),
                    serie = row["SERIE"].ToString(),
                    serieAUTO = (bool)row["SERIEAUTO"],
                    codifArticle = row["CODIFARTICLE"].ToString()
                });
            }

            var data = new
            {
                listLengthCode = listParamMaxLengthCode,
                listData = listDataFiltre, // Contient toutes les données sauf pour magasins où c'est filtré
                listDataSite = listSite,
                listDataSite2 = listSite2,
                listDataUnite = listUnite,
            };
            return Json(data, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult CRUDMonnaie(parametre objData)
        {
            var tabID = objData.tabID;
            var valeur = objData.valeur;
            var MONNAIE = objData.code;
            string filtre = "", result = "";
            bool isAllValid = true;
            var statut = objData.statut;
            DataRow row;
            Tables.MMONNAIE mMONNAIE = new Tables.MMONNAIE();
            DataTable objTab = new DataTable();
            switch (tabID)
            {
                case "Billet_Monnaie":
                    filtre = $"TYPE = 'B' and VALEUR = '{valeur}' and MONNAIE = '{MONNAIE}'";
                    break;
                case "Piece_Monnaie":
                    filtre = $"TYPE = 'P' and VALEUR = '{valeur}' and MONNAIE = '{MONNAIE}'";
                    break;
            }
            objTab = mMONNAIE.RemplirDataTable(filtre);
            if (statut) //Si Suppression
            {
                if (objTab.Rows.Count > 0)
                {
                    objTab.Rows[0].Delete();
                    mMONNAIE.Enregistrer(objTab);
                    result = "Monnaie supprimée avec succès";
                }
                else
                {
                    isAllValid = false;
                    result = "Monnaie introuvable";
                }
            }
            else //Si ajout/modification
            {
                if (objTab.Rows.Count > 0) //Edition
                {
                    result = "Cette monnaie existe déjà";
                    row = objTab.Rows[0];
                    row.BeginEdit();
                    row["VALEUR"] = valeur;
                    row.EndEdit();
                    mMONNAIE.Enregistrer(objTab);
                }
                else //Ajout
                {
                    objTab = mMONNAIE.RemplirDataTable();
                    row = objTab.NewRow();
                    row["MONNAIE"] = MONNAIE;
                    row["VALEUR"] = valeur;
                    switch (tabID)
                    {
                        case "Billet_Monnaie":
                            row["TYPE"] = "B";
                            break;
                        case "Piece_Monnaie":
                            row["TYPE"] = "P";
                            break;
                    }
                    objTab.Rows.Add(row);
                    mMONNAIE.Enregistrer(objTab);
                    result = "Monnaie ajoutée avec succès";
                }
            }
            return Json(new { statut = isAllValid, message = result }, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult Add_EditParam(parametre objData)
        {
            string result = "";
            bool isAllValid = true;
            var niveau = objData.niveau;
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
                                    foreach (var field in extraFields)
                                    {
                                        row[field.Key] = field.Value;
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
                        // Enregistrer si la méthode existe
                        if (isAllValid)
                        {
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
        
        // Génère les champs supplémentaires en fonction du niveau
        private Dictionary<string, object> SetExtraFields(string niveau, parametre objData)
        {
            bool statut = objData.statut;
            var fields = new Dictionary<string, object>();
            DataTable objTab = new DataTable();
            var filtre = "";

            switch (niveau)
            {
                case "Pays":
                case "services":
                case "groupes":
                case "unites":
                    fields["CODE"] = objData.code;
                    fields["LIBELLE"] = objData.libelle;
                    break;

                case "magasins":
                    fields["CODE"] = objData.code;
                    fields["LIBELLE"] = objData.libelle;
                    fields["SITE"] = objData.code1;
                    break;

                case "Exercices":
                    fields["DATEDEB"] = DateTime.Parse(objData.dateDebut);
                    fields["DATEFIN"] = DateTime.Parse(objData.dateFin);
                    fields["ENCOURS"] = objData.Encours;
                    fields["CLOTURE"] = false;
                    fields["GENERE"] = false;
                    break;

                case "Monnaie":
                    fields["CODE"] = objData.code;
                    fields["LIBELLE"] = objData.libelle;
                    fields["NOMDECIMALE"] = objData.libelleM;
                    fields["NBDECIMALE"] = objData.valeur;
                    break;
                case "Articles":
                    Tables_Sto.rStkArticle article = new Tables_Sto.rStkArticle();
                    filtre = $"GROUPE = '{objData.code1}' and FAMILLE = '{objData.code2}'";
                    objTab = article.RemplirDataTable(filtre);
                    Int32 codeLast = 0;
                    if (objTab.Rows.Count > 0)
                    {
                        DataRow lastRow = objTab.Rows[objTab.Rows.Count - 1];
                        codeLast = Convert.ToInt32(lastRow["SERIE"]) + 1;
                    }
                    if (statut != true) //Ajout
                    {
                        //CODE recevra comme valeur GROUPE+FAMILLE+SERIE
                        fields["CODE"] = objData.code1 + objData.code2 + codeLast;
                        fields["SERIE"] = codeLast;
                    }
                    fields["CodeBarre"] = objData.codeBarre;
                    fields["GROUPE"] = objData.code1;
                    fields["FAMILLE"] = objData.code2;
                    fields["LIBELLE"] = objData.libelle;
                    fields["REFERENCE"] = objData.reference;
                    fields["PU"] = objData.prixUnitaire;
                    fields["UNITE"] = objData.unite;
                    fields["OBSERVATION"] = objData.observation;
                    break;
                case "Affectations":
                    fields["SITE"] = objData.code1;
                    fields["MAGASIN"] = objData.code2;
                    fields["ARTICLE"] = objData.unite;
                    fields["STOCKMIN"] = objData.stockMin;
                    fields["STOCKMAX"] = objData.stockMax;
                    Tables_Sto.rStkArticle article1 = new Tables_Sto.rStkArticle();
                    filtre = $"CODE = '{objData.unite}'";
                    objTab = article1.RemplirDataTable(filtre);
                    var pu = objTab.Rows[0]["PU"].ToString();
                    if (objData.prixUnitaire == "0")
                    {
                        fields["PRIXUNITAIRE"] = pu;
                    }
                    else
                    {
                        fields["PRIXUNITAIRE"] = objData.prixUnitaire;
                    }
                    fields["DERNIERPRIX"] = objData.lastPrice;
                    fields["QUANTITEINITIALE"] = objData.QteInitiale;
                    fields["VALEURINITIALE"] = objData.valInitiale;
                    break;
            }

            return fields;
        }


        // Génère le filtre SQL en fonction du niveau
        private string GetFiltre(parametre objData)
        {
            DataTable objTab = new DataTable();
            string niveau = objData.niveau,
                    code = objData.code,
                    site = objData.code1,
                    annee = objData.annee;
            bool statut = objData.statut;

            switch (niveau)
            {
                case "Pays":
                case "services":
                case "groupes":
                case "unites":
                case "Monnaie":
                    return $"CODE = '{code}'";
                case "magasins":
                    return $"CODE = '{code}' AND SITE = '{site}'";
                case "Exercices":
                    return $"ANNEE = '{annee}'";
                case "Articles":
                    Tables_Sto.rStkArticle article = new Tables_Sto.rStkArticle();
                    var filter = $"GROUPE = '{objData.code1}' and FAMILLE = '{objData.code2}'";
                    objTab = article.RemplirDataTable(filter);
                    Int32 codeLast = 0;
                    if (objTab.Rows.Count > 0)
                    {
                        DataRow lastRow = objTab.Rows[objTab.Rows.Count - 1];
                        codeLast = Convert.ToInt32(lastRow["SERIE"]) + 1;
                    }
                    if (statut == true) //Edition
                    {
                        //CODE recevra comme valeur GROUPE+FAMILLE+SERIE
                        code = objData.code1 + objData.code2 + (codeLast - 1);
                    }
                    else //Ajout
                    {
                        //CODE recevra comme valeur GROUPE+FAMILLE+SERIE
                        code = objData.code1 + objData.code2 + codeLast;
                    }
                    return $"CODE = '{code}'";
                case "Affectations":
                    return $"SITE = '{objData.code1}' AND MAGASIN = '{objData.code2}' AND ARTICLE = '{objData.unite}'";
                default:
                    return "";
            }
        }


        // Retourne l'instance de la table en fonction du niveau
        private object GetTableInstance(string niveau)
        {
            switch (niveau)
            {
                case "Pays": return new Tables_Sto.rPays();
                case "services": return new Tables_Sto.rService();
                case "groupes": return new Tables_Sto.rGroupeFamille();
                case "unites": return new Tables_Sto.rUnite();
                case "magasins": return new Tables_Sto.rMagasin();
                case "Exercices": return new Tables_Sto.rExercice();
                case "Monnaie": return new Tables_Sto.rMonnaie();
                case "Articles": return new Tables_Sto.rStkArticle();
                case "Affectations": return new Tables_Sto.mAffectation();
                default: return null;
            }
        }

        [HttpPost]
        public JsonResult DelParam(parametre objData)
        {
            string result = "";
            bool isAllValid = true;
            var code = objData.code;
            var site = objData.code1;
            var niveau = objData.niveau;
            object tableInstance = null;
            string tableType = "",filtre = "";
            DataTable table = new DataTable();
            switch (niveau)
            {
                case "Pays":
                    tableInstance = new Tables_Sto.rPays();
                    break;
                case "services":
                    tableInstance = new Tables_Sto.rService();
                    break;
                case "groupes":
                    tableInstance = new Tables_Sto.rGroupeFamille();
                    break;
                case "unites":
                    tableInstance = new Tables_Sto.rUnite();
                    break;
                case "magasins":
                    tableInstance = new Tables_Sto.rMagasin();
                    break;
                case "Exercices":
                    tableInstance = new Tables_Sto.rExercice();
                    break;
                case "Monnaie":
                    tableInstance = new Tables_Sto.rMonnaie();
                    break;
                case "Articles":
                    tableInstance = new Tables_Sto.rStkArticle();
                    break;
                case "Affectations":
                    tableInstance = new Tables_Sto.mAffectation();
                    break;
            }
            if (tableInstance != null)
            {
                tableType = tableInstance.GetType().Name;
            }
            long totalCount = GetTotalOccurrences(niveau, objData);
            string requete = "";
            bool etat = true;
            if (totalCount > 0)
            {
                isAllValid = false;
            }
            else
            {
                switch (niveau)
                {
                    case "Pays":
                    case "services":
                    case "groupes":
                    case "unites":
                    case "Monnaie":
                    case "Articles":
                        requete = "DELETE FROM " + tableType + " where CODE = '" + code + "'";
                        break;
                    case "magasins":
                        requete = "DELETE FROM " + tableType + " where CODE = '" + code + "' and SITE = '" + site + "'";
                        break;
                    case "Exercices":
                        filtre = $"ANNEE = '{code}' and ENCOURS = 1";
                        var remplirDataTableMethod = tableInstance.GetType().GetMethod("RemplirDataTable", new Type[] { typeof(string) });
                        table = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { filtre });
                        if (table.Rows.Count > 0)
                        {
                            isAllValid = false;
                            etat = false;
                        }
                        else
                        {
                            requete = "DELETE FROM " + tableType + " where ANNEE = '" + code + "'";
                        }
                        break;
                    case "Affectations":
                        requete = "DELETE FROM " + tableType + " where SITE = '" + objData.code1 + "' and MAGASIN = '" + objData.code2 + "' and ARTICLE = '" + code + "'";
                        break;
                }
            }
            if (isAllValid)
            {
                result = "Enregistrement supprimé avec succès ";
                conn.Open();
                com.Connection = conn;
                com.CommandText = requete;
                dr = com.ExecuteReader();
                conn.Close();
            }
            else
            {
                if (!etat)
                {
                    result = "Suppression impossible : Exercice en Cours !!!";
                }
                else
                {
                    result = "Suppression impossible : Codification rattachée !!!";
                }
            }
            return Json(new { statut = isAllValid, message = result }, JsonRequestBehavior.AllowGet);
        }
        private long GetTotalOccurrences(string niveau,parametre objData)
        {

            long totalCount = 0;
            string nomColonne = "", nomColonne1 = "", filtre = "";
            switch (niveau)
            {
                case "Pays":
                    nomColonne = "pays";
                    break;
                case "services":
                    nomColonne = "service";
                    break;
                case "groupes":
                    nomColonne = "GROUPE";
                    break;
                case "unites":
                    nomColonne = "UNITE";
                    break;
                case "Exercices":
                    nomColonne = "ANNEE";
                    break;
                case "Monnaie":
                    nomColonne = "MONNAIE";
                    break;
                case "Articles":
                    nomColonne = "ARTICLE";
                    break;
                case "magasins":
                    nomColonne = "MAGASIN";
                    nomColonne1 = "SITE";
                    break;

            }
            conn.Open();
            com.Connection = conn;
            string query = "";
            switch (niveau)
            {
                case "Pays":
                case "services":
                case "groupes":
                case "unites":
                case "Monnaie":
                case "Articles":
                    query = @"
                            DECLARE @sql NVARCHAR(MAX) = N'';
                                DECLARE @tableName NVARCHAR(128);

                                DECLARE table_cursor CURSOR FOR 
                                SELECT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                                WHERE COLUMN_NAME = @nomColonne;

                                OPEN table_cursor;
                                FETCH NEXT FROM table_cursor INTO @tableName;

                                WHILE @@FETCH_STATUS = 0 
                                BEGIN
                                    SET @sql = @sql + 
                                    'SELECT ''' + @tableName + ''' AS TableName, COUNT(*) AS NombreOccurrences 
                                     FROM ' + QUOTENAME(@tableName) + ' 
                                     WHERE ' + QUOTENAME(@nomColonne) + ' IS NOT NULL 
                                     AND LTRIM(RTRIM(CAST(' + QUOTENAME(@nomColonne) + ' AS VARCHAR(MAX)))) <> '''' 
                                     AND CAST(' + QUOTENAME(@nomColonne) + ' AS VARCHAR(MAX)) = @code
                                     UNION ALL ';

                                    FETCH NEXT FROM table_cursor INTO @tableName;
                                END

                                CLOSE table_cursor;
                                DEALLOCATE table_cursor;

                                -- Supprimer le dernier 'UNION ALL' et exécuter la requête
                                SET @sql = LEFT(@sql, LEN(@sql) - 10);  

                                IF @sql <> ''
                                BEGIN
                                    SET @sql = 'SELECT SUM(NombreOccurrences) AS TotalOccurrences FROM (' + @sql + ') AS T;';
                                    EXEC sp_executesql @sql, N'@code VARCHAR(MAX)', @code;
                                END
                            ";
                    break;
                case "Exercices":
                    query = @"
                            DECLARE @sql NVARCHAR(MAX) = N'';
                                DECLARE @tableName NVARCHAR(128);

                                DECLARE table_cursor CURSOR FOR 
                                SELECT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                                WHERE COLUMN_NAME = @nomColonne
                                AND TABLE_NAME <> 'REXERCICE';  -- Exclusion de la table REXERCICE;;

                                OPEN table_cursor;
                                FETCH NEXT FROM table_cursor INTO @tableName;

                                WHILE @@FETCH_STATUS = 0 
                                BEGIN
                                    SET @sql = @sql + 
                                    'SELECT ''' + @tableName + ''' AS TableName, COUNT(*) AS NombreOccurrences 
                                     FROM ' + QUOTENAME(@tableName) + ' 
                                     WHERE ' + QUOTENAME(@nomColonne) + ' IS NOT NULL 
                                     AND LTRIM(RTRIM(CAST(' + QUOTENAME(@nomColonne) + ' AS VARCHAR(MAX)))) <> '''' 
                                     AND CAST(' + QUOTENAME(@nomColonne) + ' AS VARCHAR(MAX)) = @code
                                     UNION ALL ';

                                    FETCH NEXT FROM table_cursor INTO @tableName;
                                END

                                CLOSE table_cursor;
                                DEALLOCATE table_cursor;

                                -- Supprimer le dernier 'UNION ALL' et exécuter la requête
                                SET @sql = LEFT(@sql, LEN(@sql) - 10);  

                                IF @sql <> ''
                                BEGIN
                                    SET @sql = 'SELECT SUM(NombreOccurrences) AS TotalOccurrences FROM (' + @sql + ') AS T;';
                                    EXEC sp_executesql @sql, N'@code VARCHAR(MAX)', @code;
                                END
                            ";
                    break;
                case "magasins":
                    query = @"
                            DECLARE @sql NVARCHAR(MAX) = N'';
                            DECLARE @tableName NVARCHAR(128);

                            DECLARE table_cursor CURSOR FOR
                            SELECT TABLE_NAME
                            FROM INFORMATION_SCHEMA.COLUMNS
                            WHERE COLUMN_NAME = @nomColonne
                            AND TABLE_NAME IN(SELECT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME = @nomColonne1);

                                                OPEN table_cursor;
                                                FETCH NEXT FROM table_cursor INTO @tableName;

                                                WHILE @@FETCH_STATUS = 0
                            BEGIN
                                -- Ajouter la requête pour la table courante
                                SET @sql = @sql +
                                'SELECT ''' + @tableName + ''' AS TableName, COUNT(*) AS NombreOccurrences 
                                 FROM ' + QUOTENAME(@tableName) + '
                                 WHERE ' + QUOTENAME(@nomColonne) + ' IS NOT NULL
                                 AND ' + QUOTENAME(@nomColonne1) + ' IS NOT NULL
                                AND CAST(' + QUOTENAME(@nomColonne) + ' AS VARCHAR(MAX)) = @code
								 AND CAST(' + QUOTENAME(@nomColonne1) + ' AS VARCHAR(MAX)) = @code1
                                 UNION ALL ';

                                FETCH NEXT FROM table_cursor INTO @tableName;
                                                END

                                                CLOSE table_cursor;
                                                DEALLOCATE table_cursor;

                                                --Supprimer le dernier 'UNION ALL' et exécuter la requête
                            IF LEN(@sql) > 0
                            BEGIN
                                SET @sql = LEFT(@sql, LEN(@sql) - 10);
                                SET @sql = 'SELECT SUM(NombreOccurrences) AS TotalOccurrences FROM (' + @sql + ') AS T;';
                    
                                -- Passer correctement les paramètres à sp_executesql
                                EXEC sp_executesql @sql, 
                                    N'@code VARCHAR(MAX), @code1 VARCHAR(MAX)', 
                                    @code, @code1;
                             END
                            ";
                    break;
            }
            com.CommandText = query;
            com.Parameters.AddWithValue("@nomColonne", nomColonne);
            switch (niveau)
            {
                case "Pays":
                case "services":
                case "groupes":
                case "unites":
                case "Exercices":
                case "Monnaie":
                case "Articles":
                    com.Parameters.AddWithValue("@code", objData.code);
                    break;
                case "magasins":
                    com.Parameters.AddWithValue("@nomColonne1", nomColonne1);
                    com.Parameters.AddWithValue("@code1", objData.code1);
                    break;
            }
            DataTable objTable = new DataTable();
            switch (niveau)
            {
                case "Affectations":
                    Tables_Sto.mMouvement mMouvement = new Tables_Sto.mMouvement();
                    filtre = $"SITE = '{objData.code1}' and MAGASIN = '{objData.code2}' and ARTICLE = '{objData.unite}'";
                    objTable = mMouvement.RemplirDataTable(filtre);
                    if (objTable.Rows.Count > 0)
                    {
                        totalCount = Convert.ToInt64(objTable.Rows.Count);
                    }
                    break;
                default:
                    dr = com.ExecuteReader();
                    objTable.Load(dr);
                    if (objTable.Rows.Count > 0 && objTable.Rows[0]["TotalOccurrences"] != DBNull.Value)
                    {
                        totalCount = Convert.ToInt64(objTable.Rows[0]["TotalOccurrences"]);
                    }
                    break;
            }
            conn.Close();
            return totalCount;
        }

        [HttpPost]
        public JsonResult AllInOutArticle(parametre objData)
        {
            var result = "Enregistrement traitée avec succès";
            Tables_Sto.mMouvement mMouvement = new Tables_Sto.mMouvement();
            var exercice = objData.annee;
            var numBon = objData.numBon;
            var numBl = objData.numBl;
            var dateSaisie = objData.dateDebut;
            var compte = objData.compte;
            var compteAuxi = objData.compteAuxi;
            var site = objData.site;
            var magasin = objData.magasin;
            foreach (var item in objData.tabList)
            {
                DataTable objTab = mMouvement.RemplirDataTable();
                DataRow row = objTab.NewRow();
                var filtreArt = $"CODE = '{item.code}'";
                BDD.Divers objBDDDiver = new BDD.Divers();
                var unite = objBDDDiver.GetLibelle(filtreArt, Abstraite.enumPlan.ARTICLESTOCK, Tables_Sto.rStkArticle.GetChamp.Unite.ToString());
                try
                {
                    row["DATEMOUVEMENT"] = dateSaisie;
                    row["SITE"] = site;
                    row["MAGASIN"] = magasin;
                    row["ARTICLE"] = item.code;
                    row["NUMPIECE"] = numBl;
                    row["NUMBC"] = numBon;
                    row["LIBELLE"] = item.libelle;
                    row["SIGNE"] = "E";
                    row["CONSOMMATEUR"] = "";
                    row["SERVICE"] = "";
                    row["PRIXUNITAIRE"] = Convert.ToDecimal(item.PU, CultureInfo.InvariantCulture);
                    row["QUANTITE"] = item.Qte;
                    row["VALEUR"] = Convert.ToDecimal(item.valeur, CultureInfo.InvariantCulture);
                    row["COMMENTAIRE"] = item.commentaire;
                    row["UNITE"] = unite;
                    row["COGE"] = compte;
                    row["AUXI"] = compteAuxi;
                    row["TVA"] = Convert.ToDecimal(item.TVA, CultureInfo.InvariantCulture);
                    row["MONTANTTVA"] = Convert.ToDecimal(item.montantTVA, CultureInfo.InvariantCulture);
                    objTab.Rows.Add(row);
                    mMouvement.Enregistrer(objTab);
                }
                catch (Exception ex)
                {

                    throw;
                }
            }
            return Json(new
            {
                message = result
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult AllAffectArticle(parametre objData)
        {
            var result = "Affectation traitée avec succès";
            Tables_Sto.mAffectation mAffectation = new Tables_Sto.mAffectation();
            var site = objData.code1;
            var magasin = objData.code2;
            foreach (var item in objData.tabList)
            {
                DataTable objTab = mAffectation.RemplirDataTable();
                DataRow row = objTab.NewRow();
                var filtreArt = $"CODE = '{item.code}'";
                BDD.Divers objBDDDiver = new BDD.Divers();
                var prixUnitaire = objBDDDiver.GetLibelle(filtreArt, Abstraite.enumPlan.ARTICLESTOCK, Tables_Sto.rStkArticle.GetChamp.PU.ToString());
                if (prixUnitaire == "" || prixUnitaire == null)
                {
                    prixUnitaire = "0";
                }
                //Verifier si l article est deja affecte
                Tables_Sto.mAffectation mAffectation1 = new Tables_Sto.mAffectation();
                var filterAffect = $"SITE = '{site}' AND MAGASIN = '{magasin}' AND ARTICLE = '{item.code}'";
                DataTable tabAffect = mAffectation1.RemplirDataTable(filterAffect);
                var article = objBDDDiver.GetLibelle(filterAffect, Abstraite.enumPlan.MAFFECTATION, Tables_Sto.mAffectation.GetChamp.Article.ToString());
                if (article != item.code)
                {
                    row["SITE"] = site;
                    row["MAGASIN"] = magasin;
                    row["ARTICLE"] = item.code;
                    row["PRIXUNITAIRE"] = prixUnitaire;
                    row["STOCKMIN"] = 0;
                    row["STOCKMAX"] = 0;
                    row["DERNIERPRIX"] = 0;
                    row["QUANTITEINITIALE"] = 0;
                    row["VALEURINITIALE"] = 0;
                    objTab.Rows.Add(row);
                    try
                    {
                        mAffectation.Enregistrer(objTab);
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                }
            }
            return Json(new
            {
                message = result
            }, JsonRequestBehavior.AllowGet);
        }
    }
}