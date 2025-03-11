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
        [HttpGet]
        public JsonResult GetDataParam(string code)
        {
            List<parametre> listData = new List<parametre>();
            DataTable objTable = new DataTable();
            switch (code)
            {
                case "Pays":
                    Tables.rPays rPays = new Tables.rPays();
                    objTable = rPays.RemplirDataTable();
                    break;
            }
            foreach (DataRow row in objTable.Rows)
            {
                listData.Add(new parametre()
                {
                    code = row["code"].ToString(),
                    libelle = row["libelle"].ToString(),
                });
            }
            return Json(listData, JsonRequestBehavior.AllowGet);
        }
    }
}