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
                ViewBag.Controleur = "Codifications";
                ViewBag.page = "Structures";
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
                ViewBag.Controleur = "Codifications";
                ViewBag.page = "PlanCompte";
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
                ViewBag.Controleur = "Codifications";
                ViewBag.page = "ParametreGeneraux";
                return View();
            }
        }
        public JsonResult GetListDataStruct(string id)
        {
            List<parametre> listData = new List<parametre>();
            DataTable objTab = new DataTable();
            switch (id)
            {
                case "Budget":
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
                    break;
            }
            return Json(listData, JsonRequestBehavior.AllowGet);
        }
    }
}