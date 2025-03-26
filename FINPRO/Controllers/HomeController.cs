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

namespace FINPRO.Controllers {
    public class HomeController : Controller {
        SqlCommand com = new SqlCommand();
        SqlDataReader dr;
        SqlConnection conn = new SqlConnection(GetConnexion.GetConnectionString());
        //BDD.Connexion.structConnexion structConnection = new BDD.Connexion.structConnexion();
        //BDD.Connexion objConnect = new BDD.Connexion();
        parametre parametre = new parametre();
        public ActionResult Index() {
            Session["titre"] = "FINPRONET";
            var Success = "Connexion Valide";
            BDD.Connexion.Serveur = BDD.Connexion.enumServeur.WEB;
            FinproConfig objConfig = new FinproConfig();
            FinproXmlFile objFinproXml = new FinproXmlFile();
            System.Web.UI.Page Page = new System.Web.UI.Page();
            var path = System.Web.Hosting.HostingEnvironment.MapPath("/Configuration.config");

            objFinproXml = objConfig.DecrypterFichierConfig(path, DBINSTALL.FinproConfig.enumTypeFile.FINPRONET);
            bool a = true;
            a = objFinproXml.MultiProjets;
            var NomBase = objFinproXml.NomBase;
            var nomServeur = objFinproXml.NomServeur;
            int result = a ? 1 : 0;
            ViewBag.Success = Success;
            List<parametre> listData = new List<parametre>();
            //SqlConnection con = null;
            try
            {
                //con = new SqlConnection(GetConnectionString());
                BDD.Connexion.structConnexion structConnection = new BDD.Connexion.structConnexion();
                BDD.Connexion objConnect = new BDD.Connexion();
                conn.Open();
                SqlCommand commandToCheckCode = new SqlCommand("SELECT " +
                                                                " LEFT(@@VERSION, " +
                                                                     " PATINDEX('%Jan %', @@VERSION + 'Jan') - 1 + " +
                                                                     " PATINDEX('%Feb %', @@VERSION + 'Feb') - 1 + " +
                                                                     " PATINDEX('%Mar %', @@VERSION + 'Mar') - 1 + " +
                                                                     " PATINDEX('%Apr %', @@VERSION + 'Apr') - 1 + " +
                                                                     " PATINDEX('%May %', @@VERSION + 'May') - 1 + " +
                                                                     " PATINDEX('%Jun %', @@VERSION + 'Jun') - 1 + " +
                                                                     " PATINDEX('%Jul %', @@VERSION + 'Jul') - 1 + " +
                                                                     " PATINDEX('%Aug %', @@VERSION + 'Aug') - 1 + " +
                                                                     " PATINDEX('%Sep %', @@VERSION + 'Sep') - 1 + " +
                                                                     " PATINDEX('%Oct %', @@VERSION + 'Oct') - 1 + " +
                                                                     " PATINDEX('%Nov %', @@VERSION + 'Nov') - 1 + " +
                                                                     " PATINDEX('%Dec %', @@VERSION + 'Dec') - 1 " +
                                                                ") AS VersionSQL", conn);
                string versionSql = (string)commandToCheckCode.ExecuteScalar();
                ViewBag.versionSql = versionSql;
                ViewBag.NomServeur = objFinproXml.NomServeur;
                ViewBag.NomBase = objFinproXml.NomBase;
                ViewBag.NomUser = objFinproXml.NomUtilisateur;
                ViewBag.passWord = objFinproXml.MotdePasse;
                if (result == 1)
                {
                    using (SqlConnection con = new SqlConnection(GetConnexion.GetConnectionString()))
                    {
                        con.Open();
                        // Vérifier si la base de données FINCONF existe
                        string checkDatabaseQuery = "SELECT database_id FROM sys.databases WHERE Name = @DatabaseName";
                        using (SqlCommand cmd = new SqlCommand(checkDatabaseQuery, con))
                        {
                            cmd.Parameters.AddWithValue("@DatabaseName", NomBase);
                            object result1 = cmd.ExecuteScalar();

                            if (result1 == null)
                            {
                                ViewBag.Multiproj = "";
                                //ViewBag.Message = "La base de données " + NomBase + " n'existe pas.";
                                return View(parametre);
                            }
                        }

                        // Vérifier si la table rBase existe dans FINCONF
                        string checkTableQuery = @"USE " + NomBase + ";SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @TableName";
                        using (SqlCommand cmd = new SqlCommand(checkTableQuery, con))
                        {
                            cmd.Parameters.AddWithValue("@TableName", "rBase");
                            object result1 = cmd.ExecuteScalar();

                            if (result1 == null)
                            {
                                ViewBag.Multiproj = "";
                                //ViewBag.Message = "La table rBase n'existe pas dans la base de données " + NomBase + ".";
                                ViewBag.Message = "Echec de la connexion.Les paramètres de configuration sont invalides.";
                                return View(parametre);
                            }
                        }

                        //ViewBag.Message = "La base de données et la table existent.";
                        Tables.rBase rBase = new Tables.rBase();
                        var filtre = Tables.rBase.GetChamp.Nature.ToString() + " = 'PAIE'";
                        DataTable objTable = rBase.RemplirDataTable(filtre);
                        foreach (DataRow row in objTable.Rows)
                        {
                            listData.Add(new parametre()
                            {
                                code = row["NumEnreg"].ToString(),
                                sigle = row["Sigle"].ToString(),
                                libelle = row["Libelle"].ToString(),
                                typeBase = row["TypeBase"].ToString(),
                                nomServeur = row["NomServeur"].ToString(),
                                nomBase = row["NomBase"].ToString(),
                                nomUtilisateur = row["NomUtilisateur"].ToString(),
                                motDePasse = row["MotdePasse"].ToString(),
                                statut = bool.Parse(row["ENCOURS"].ToString()),
                            });
                        }
                        ViewBag.Multiproj = result;
                        parametre.all_parametre = listData;
                    }
                }
                else
                {
                    ViewBag.Multiproj = result;
                    structConnection.NomServeur = objFinproXml.NomServeur;
                    structConnection.NomUtilisateur = objFinproXml.NomUtilisateur;
                    structConnection.MotDePasse = objFinproXml.MotdePasse;
                    structConnection.NomBase = objFinproXml.NomBase;

                    structConnection.Serveur = Connexion.enumServeur.WEB;
                    switch (objFinproXml.TypeServeur)
                    {
                        case DbCreationBase.enumTypeServeur.SQL:
                            BDD.Connexion.TypeServeur = BDD.Connexion.EnumTypeServeur.SQL;
                            break;
                        case DbCreationBase.enumTypeServeur.ORACLE:
                            BDD.Connexion.TypeServeur = BDD.Connexion.EnumTypeServeur.ORACLE;
                            break;
                        case DbCreationBase.enumTypeServeur.ACCESS:
                            BDD.Connexion.TypeServeur = BDD.Connexion.EnumTypeServeur.ACCESS;
                            break;
                    }

                    if (objConnect.TestConnexion(structConnection) == true)
                    {
                        ViewBag.Multiproj = result;
                        ViewBag.Message = "Connexion réussie";
                    }
                    else
                    {
                        ViewBag.Multiproj = "";
                        ViewBag.Message = "Echec de la connexion.Serveur introuvable!Recommencer la tentative de connexion !";
                    }
                }

            }
            catch (SqlException ex)
            {
                ViewBag.Multiproj = "";
                //ViewBag.Message = "Erreur SQL : " + ex.Message;
                ViewBag.Message = "Echec de la connexion.Serveur introuvable!Recommencer la tentative de connexion !";
            }
            catch (Exception ex)
            {
                ViewBag.Multiproj = "";
                //ViewBag.Message = "Erreur : " + ex.Message;
                ViewBag.Message = "Echec de la connexion.Les paramètres de configuration sont invalides.";
            }
            return View(parametre);
        }
        [HttpPost]
        public JsonResult checkLoginPasswod(parametre objData)
        {
            //Configuration();
            var login = objData.login;
            int etat = 0;
            BDD.Connexion.Serveur = BDD.Connexion.enumServeur.WEB;
            var nomServeur = objData.nomServeur;
            var NomBase = objData.nomBase;
            var NomUtilisateur = objData.nomUtilisateur;
            var MotDePasse = objData.motDePasse;
            BDD.Connexion.NomServeur = nomServeur;
            BDD.Connexion.NomBase = NomBase;
            BDD.Connexion.NomUtilisateur = NomUtilisateur;
            BDD.Connexion.MotdePasse = MotDePasse;
            Tables.rUser rUser = new Tables.rUser();
            var filtre = Tables.rUser.GetChamp.Login.ToString() + " = '" + login + "'";
            DataTable objTable = rUser.RemplirDataTable(filtre);
            if (objTable.Rows.Count > 0)
            {
                var loginActuel = (string)objTable.Rows[0][Tables.rUser.GetChamp.Login.ToString()];
                if (login == loginActuel)
                {
                    string password = objTable.Rows[0][Tables.rUser.GetChamp.PassWord.ToString()] as string ?? string.Empty;
                    if (password == "" || password == null)
                    {
                        etat = 1;
                    }
                    else
                    {
                        etat = 2;
                    }
                }
                else
                {
                    etat = 2;
                }
            }
            else
            {
                etat = 2;
            }
            return Json(new { statut = etat }, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult login(parametre user)
        {
            Tables.rUser rUser = new Tables.rUser();
            var login = user.login;
            string password = rUser.CryptagePasswordBis(user.password);
            BDD.Connexion.Serveur = BDD.Connexion.enumServeur.WEB;
            FinproConfig objConfig = new FinproConfig();
            FinproXmlFile objFinproXml = new FinproXmlFile();
            System.Web.UI.Page Page = new System.Web.UI.Page();
            var path = System.Web.Hosting.HostingEnvironment.MapPath("/Configuration.config");

            objFinproXml = objConfig.DecrypterFichierConfig(path, DBINSTALL.FinproConfig.enumTypeFile.FINPRONET);
            bool a = true;
            a = objFinproXml.MultiProjets;
            int result = a ? 1 : 0;
            var isAllValid = true;
            bool etatCompte = true;

            var message = "";
            var nomServeur = user.nomServeur;
            var NomBase = user.nomBase;
            var NomUtilisateur = user.nomUtilisateur;
            var MotDePasse = user.motDePasse;

            BDD.Connexion.NomServeur = nomServeur;
            BDD.Connexion.NomBase = NomBase;
            BDD.Connexion.NomUtilisateur = NomUtilisateur;
            BDD.Connexion.MotdePasse = MotDePasse;

            var filtre = Tables.rUser.GetChamp.Login.ToString() + " = '" + login + "'";
            DataTable objTable = rUser.RemplirDataTable(filtre);

            string connectionString = "Data Source = " + nomServeur + "; database = " + NomBase + "; user id = " + NomUtilisateur + "; password = " + MotDePasse + ";";
            SqlConnection conn = new SqlConnection(connectionString);
            conn.Open();
            com.Connection = conn;
            NomBase = objFinproXml.NomBase;
            // Vérifier si la table rBase existe dans FINCONF
            string checkTableQuery = @"USE " + NomBase + ";SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @TableName";
            using (SqlCommand cmd = new SqlCommand(checkTableQuery, conn))
            {
                cmd.Parameters.AddWithValue("@TableName", "RUSER");
                object result1 = cmd.ExecuteScalar();
                if (result1 == null)
                {
                    ViewBag.Multiproj = "";
                    //ViewBag.Message = "La table rBase n'existe pas dans la base de données " + NomBase + ".";
                    message = "Echec de la connexion.Les paramètres de configuration sont invalides.";
                    isAllValid = false;
                }
                else
                {
                    if (objTable.Rows.Count > 0)
                    {
                        var loginActuel = (string)objTable.Rows[0][Tables.rUser.GetChamp.Login.ToString()];
                        if (login == loginActuel)
                        {
                            string passwordActuel = objTable.Rows[0][Tables.rUser.GetChamp.PassWord.ToString()] as string ?? string.Empty;
                            switch (passwordActuel)
                            {
                                case "":
                                case null:
                                    conn.Open();
                                    com.Connection = conn;
                                    com.CommandText = "update RUSER set PASSWORD = '" + password + "' where LOGIN = '" + login + "'";
                                    dr = com.ExecuteReader();
                                    conn.Close();
                                    etatCompte = (bool)objTable.Rows[0][Tables.rUser.GetChamp.Actif.ToString()];
                                    if (!etatCompte)
                                    {
                                        isAllValid = false;
                                        message = "Ce compte est désactivé";
                                    }
                                    break;
                                default:
                                    var filtreConnexion = Tables.rUser.GetChamp.Login.ToString() + " = '" + login + "' and " + Tables.rUser.GetChamp.PassWord.ToString() + " = '" + password + "'";
                                    DataTable objTabConn = rUser.RemplirDataTable(filtreConnexion);
                                    //var statutPassword = string.Equals(password, passwordActuel, StringComparison.OrdinalIgnoreCase); //Sensible a la casse
                                    if (password == passwordActuel)
                                    {
                                        etatCompte = (bool)objTabConn.Rows[0][Tables.rUser.GetChamp.Actif.ToString()];
                                        if (!etatCompte)
                                        {
                                            isAllValid = false;
                                            message = "Ce compte est désactivé";
                                        }
                                    }
                                    else
                                    {
                                        isAllValid = false;
                                        message = "Login ou mot de passe incorrect";
                                    }
                                    break;
                            }
                        }
                        if (isAllValid)
                        {
                            Session["LOGIN"] = login;
                            Session["GROUPE"] = (string)objTable.Rows[0][Tables.rUser.GetChamp.Groupe.ToString()];

                            Session["NomServeur"] = nomServeur;
                            Session["NomBase"] = NomBase;
                            Session["NomUtilisateur"] = NomUtilisateur;
                            Session["MotDePasse"] = MotDePasse;
                            Session["result"] = message;
                            Tables.rGroup rGroup = new Tables.rGroup();
                            var filtreGroupe = Tables.rGroup.GetChamp.Code.ToString() + " = '" + Session["GROUPE"].ToString() + "'";
                            DataTable tabGr = rGroup.RemplirDataTable(filtreGroupe);
                            Session["TypeGroupe"] = (string)tabGr.Rows[0][Tables.rGroup.GetChamp.Type.ToString()];
                            Session["pass"] = user.password;
                        }
                    }
                    else
                    {
                        isAllValid = false;
                        message = "Login ou mot de passe incorrect";
                    }
                }
            }
            conn.Close();
            return Json(new
            {
                statut = isAllValid,
                message = message
            }, JsonRequestBehavior.AllowGet);
        }
        public ActionResult account()
        {
            if (Session["LOGIN"] == null)
            {
                return RedirectToAction("Index", "Home");
            }
            else
            {
                return View(parametre);
            }
        }
        //Déconnexion
        public ActionResult Logout()
        {
            Session.Abandon();
            FormsAuthentication.SignOut();
            return RedirectToAction("Index");
        }
    }
}