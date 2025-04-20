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
    public class FINSTOCKSaisieController : Controller
    {
        // GET: FINSTOCKSaisie
        SqlCommand com = new SqlCommand();
        SqlDataReader dr;
        SqlConnection conn = new SqlConnection(GetConnexion.GetConnectionString());
        parametre parametre = new parametre();
        public ActionResult Articles()
        {
            if (Session["LOGIN"] == null)
            {
                return RedirectToAction("Index", "Home");
            }
            else
            {
                ViewBag.NameTitrecontroller = "FINSTOCK";
                ViewBag.Projet = "Articles";
                ViewBag.Controleur = "Saisie";
                return View(parametre);
            }
        }
        public ActionResult Affectations()
        {
            if (Session["LOGIN"] == null)
            {
                return RedirectToAction("Index", "Home");
            }
            else
            {
                ViewBag.NameTitrecontroller = "FINSTOCK";
                ViewBag.Projet = "Affectations";
                ViewBag.Controleur = "Saisie";
                return View(parametre);
            }
        }
    }
}