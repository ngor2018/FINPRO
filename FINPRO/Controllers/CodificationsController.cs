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
    public class CodificationsController : Controller
    {
        // GET: Codifications
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
                ViewBag.Projet = "FINPRONET";
                ViewBag.Controleur = "Structures";
                return View();
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
        public JsonResult GetListDataStruct(string id)
        {
            List<parametre> listData = new List<parametre>();
            DataTable objTab = new DataTable();
            DataTable objTab1 = new DataTable();
            int cpte = 0;
            switch (id)
            {
                case "StructPlanBudget":
                    Tables.rStruPost rStruPost = new Tables.rStruPost();
                    objTab = rStruPost.RemplirDataTable();
                    foreach (DataRow row in objTab.Rows)
                    {
                        listData.Add(new parametre()
                        {
                            niveau = row[Tables.rStruPost.GetChamp.Niveau.ToString()].ToString(),
                            libelle = row[Tables.rStruPost.GetChamp.Libelle.ToString()].ToString(),
                            abreviation = row[Tables.rStruPost.GetChamp.Abreviation.ToString()].ToString(),
                            format = row[Tables.rStruPost.GetChamp.Format.ToString()].ToString(),
                            titre = row[Tables.rStruPost.GetChamp.Titre.ToString()].ToString(),
                            abreviationTitre = row[Tables.rStruPost.GetChamp.TitreCourt.ToString()].ToString(),
                        });
                    }
                    Tables.rPost1 rPost1 = new Tables.rPost1();
                    objTab1 = rPost1.RemplirDataTable();
                    cpte = (int)objTab1.Rows.Count;
                    break;
            }
            var data = new
            {
                total = cpte,
                listData = listData
            };
            return Json(data, JsonRequestBehavior.AllowGet);
        }
    }
}