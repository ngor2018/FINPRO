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
    public class ParametreController : Controller
    {
        // GET: Parametre
        SqlCommand com = new SqlCommand();
        SqlDataReader dr;
        SqlConnection conn = new SqlConnection(GetConnexion.GetConnectionString());
        parametre parametre = new parametre();
        public ActionResult Pays()
        {
            if (Session["LOGIN"] == null)
            {
                return RedirectToAction("Index", "Home");
            }
            else
            {
                ViewBag.Projet = "Gestion Stock";
                ViewBag.Controleur = "Paramètre";
                return View(parametre);
            }
        }
        public ActionResult services()
        {
            if (Session["LOGIN"] == null)
            {
                return RedirectToAction("Index", "Home");
            }
            else
            {
                ViewBag.Projet = "Gestion Stock";
                ViewBag.Controleur = "Paramètre";
                return View(parametre);
            }
        }
        [HttpGet]
        public JsonResult GetDataParam(string code, string start, string End)
        {
            List<parametre> listData = new List<parametre>();
            List<parametre> listDataFiltre = new List<parametre>();
            DataTable objTabFiltre = new DataTable();
            DataTable objTable = new DataTable();
            object tableInstance = null;
            switch (code)
            {
                case "Pays":
                    tableInstance = new Tables.rPays();
                    break;
                case "services":
                    tableInstance = new Tables.RSERVICES();
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
            DataRow firstRow = objTable.Rows[0];
            var codeFirst = (string)firstRow["CODE"];

            DataRow lastRow = objTable.Rows[objTable.Rows.Count - 1];
            var codeLast = (string)lastRow["CODE"];
            if (start == null || start == "" || End == null || End == "")
            {
                start = codeFirst;
                End = codeLast;
            }
            var filtre = $"CODE >= '{start}' AND CODE <= '{End}'";
            DataRow[] rowsFilters = objTable.Select(filtre);
            if (rowsFilters.Length > 0)
            {
                objTabFiltre = rowsFilters.CopyToDataTable();
            }
            else
            {
                objTabFiltre = objTable.Clone();
            }
            foreach (DataRow row in objTabFiltre.Rows)
            {
                listDataFiltre.Add(new parametre()
                {
                    code = row["code"].ToString(),
                    libelle = row["libelle"].ToString(),
                });
            }
            foreach (DataRow row in objTable.Rows)
            {
                listData.Add(new parametre()
                {
                    code = row["code"].ToString(),
                    libelle = row["libelle"].ToString(),
                });
            }
            var data = new
            {
                listData = listData,
                listDataFiltre = listDataFiltre,
                FirstRow = codeFirst,
                lastRow = codeLast,
            };
            return Json(data, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult AddParam(parametre objData)
        {
            string result = "", filtre = "";
            bool isAllValid = true;
            var niveau = objData.niveau;
            var code = objData.code;
            var libelle = objData.libelle;
            DataTable table = new DataTable();
            DataRow row;
            object tableInstance = null;
            // Déclaration du dictionnaire pour les champs supplémentaires
            Dictionary<string, object> extraFields = null;
            filtre = $"CODE = '{code}'";
            switch (niveau)
            {
                case "Pays":
                    tableInstance = new Tables.rPays();
                    break;
                case "services":
                    tableInstance = new Tables.RSERVICES();
                    break;
                case "Region":
                    tableInstance = new Tables.rAgences();
                    extraFields = new Dictionary<string, object> { { "VILLE", code } };
                    break;
            }
            // Vérification et enregistrement
            if (tableInstance != null)
            {
                var tableType = tableInstance.GetType();
                var remplirDataTableMethod = tableType.GetMethod("RemplirDataTable", new Type[] { typeof(string) });
                var enregistrerMethod = tableType.GetMethod("Enregistrer", new Type[] { typeof(DataTable) });
                if (remplirDataTableMethod != null)
                {
                    table = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { filtre });

                    if (table.Rows.Count > 0)
                    {
                        isAllValid = false;
                    }
                    else
                    {
                        table = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] {"" });
                        row = table.NewRow();
                        row["CODE"] = code;
                        row["LIBELLE"] = libelle;
                        // Ajout des champs supplémentaires s'ils existent
                        if (extraFields != null)
                        {
                            foreach (var field in extraFields)
                            {
                                row[field.Key] = field.Value;
                            }
                        }
                        table.Rows.Add(row);

                        // Enregistrer si la méthode existe
                        enregistrerMethod?.Invoke(tableInstance, new object[] { table });
                    }
                }
            }
            if (isAllValid)
            {
                result = "Enregistrement ajouté avec succès";
            }
            else
            {
                result = "Code existe déjà";
            }
            return Json(new { statut = isAllValid, message = result }, JsonRequestBehavior.AllowGet);
        }
    }
}