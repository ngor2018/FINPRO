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
    public class ParametrageController : Controller
    {
        // GET: Parametrage
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
                ViewBag.Projet = "Pays";
                ViewBag.Controleur = "Paramétrage";
                return View(parametre);
            }
        }
        public ActionResult unites()
        {
            if (Session["LOGIN"] == null)
            {
                return RedirectToAction("Index", "Home");
            }
            else
            {
                ViewBag.Projet = "Unité";
                ViewBag.Controleur = "Paramétrage";
                return View(parametre);
            }
        }
        public ActionResult EnteteProjet()
        {
            if (Session["LOGIN"] == null)
            {
                return RedirectToAction("Index", "Home");
            }
            else
            {
                ViewBag.Projet = "Entête du projet";
                ViewBag.Controleur = "Paramétrage";
                return View(parametre);
            }
        }
        public ActionResult Exercices()
        {
            if (Session["LOGIN"] == null)
            {
                return RedirectToAction("Index", "Home");
            }
            else
            {
                ViewBag.Projet = "Exercices";
                ViewBag.Controleur = "Paramétrage";
                return View(parametre);
            }
        }
        public ActionResult Monnaie()
        {
            if (Session["LOGIN"] == null)
            {
                return RedirectToAction("Index", "Home");
            }
            else
            {
                ViewBag.Projet = "Monnaie";
                ViewBag.Controleur = "Paramétrage";
                return View(parametre);
            }
        }
    }
}