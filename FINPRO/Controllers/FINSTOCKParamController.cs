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
    public class FINSTOCKParamController : Controller
    {
        // GET: FINSTOCKParam
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
                ViewBag.NameTitrecontroller = "FINSTOCK";
                ViewBag.Projet = "Structures";
                ViewBag.Controleur = "Paramétrage";
                return View(parametre);
            }
        }
        public ActionResult groupes()
        {
            if (Session["LOGIN"] == null)
            {
                return RedirectToAction("Index", "Home");
            }
            else
            {
                ViewBag.NameTitrecontroller = "FINSTOCK";
                ViewBag.Projet = "Groupe";
                ViewBag.Controleur = "Paramétrage";
                return View(parametre);
            }
        }

        public ActionResult magasins()
        {
            if (Session["LOGIN"] == null)
            {
                return RedirectToAction("Index", "Home");
            }
            else
            {
                ViewBag.NameTitrecontroller = "FINSTOCK";
                ViewBag.Projet = "Magasin";
                ViewBag.Controleur = "Paramétrage";
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
                ViewBag.NameTitrecontroller = "FINSTOCK";
                ViewBag.Projet = "Service";
                ViewBag.Controleur = "Paramétrage";
                return View(parametre);
            }
        }
    }
}