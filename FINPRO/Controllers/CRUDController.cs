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
    public class CRUDController : Controller
    {
        // GET: CRUD
        SqlCommand com = new SqlCommand();
        SqlDataReader dr;
        SqlConnection conn = new SqlConnection(GetConnexion.GetConnectionString());
        parametre parametre = new parametre();


        [HttpGet]
        public JsonResult GetDataParam(string code, string site)
        {
            List<parametre> listDataFiltre = new List<parametre>();
            List<parametre> listSite = new List<parametre>();
            DataTable objTabFiltre = new DataTable();
            DataTable objTable = new DataTable();
            object tableInstance = null;
            switch (code)
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
                case "unite":
                    tableInstance = new Tables_Sto.rUnite();
                    break;
                case "magasins":
                    tableInstance = new Tables_Sto.rMagasin();
                    break;
                case "Exercices":
                    tableInstance = new Tables_Sto.rExercice();
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
            //DataRow firstRow = objTable.Rows[0];
            //var codeFirst = (string)firstRow["CODE"];

            //DataRow lastRow = objTable.Rows[objTable.Rows.Count - 1];
            //var codeLast = (string)lastRow["CODE"];
            var filtre = "";
            if (code == "magasins")
            {
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

                    if (string.IsNullOrEmpty(site))
                    {
                        site = codeFirstS;
                    }

                    filtre = $"SITE = '{site}'";
                    DataRow[] rowsFilters = objTable.Select(filtre);
                    objTable = rowsFilters.Length > 0 ? rowsFilters.CopyToDataTable() : objTable.Clone();
                }
            }

            // Remplissage de la liste
            switch (code)
            {
                case "Pays":
                case "signataire":
                case "groupes":
                case "services":
                case "unite":
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
                        listDataFiltre.Add(new parametre()
                        {
                            annee = row["ANNEE"].ToString(),
                            dateDebut = DateTime.Parse(row["DATEDEB"].ToString()).ToString("dd/MM/yyyy"),
                            dateFin = DateTime.Parse(row["DATEFIN"].ToString()).ToString("dd/MM/yyyy"),
                            dateCloture = DateTime.Parse(row["DATECLOTURE"].ToString()).ToString("dd/MM/yyyy"),
                            statut = bool.Parse(row["ENCOURS"].ToString())
                        });
                    }
                    break;
            }


            var data = new
            {
                listData = listDataFiltre, // Contient toutes les données sauf pour magasins où c'est filtré
                listDataSite = listSite    // Contient les sites uniquement si code == "magasins"
            };
            return Json(data, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult Add_EditParam(parametre objData)
        {
            string result = "", filtre = "";
            bool isAllValid = true;
            var niveau = objData.niveau;
            var code = objData.code;
            var libelle = objData.libelle;
            var site = objData.site;
            bool statut = objData.statut;
            DataTable table = new DataTable();
            DataRow row;
            object tableInstance = null;
            // Déclaration du dictionnaire pour les champs supplémentaires
            Dictionary<string, object> extraFields = null;
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
                case "unite":
                    tableInstance = new Tables_Sto.rUnite();
                    break;
                case "magasins":
                    tableInstance = new Tables_Sto.rMagasin();
                    extraFields = new Dictionary<string, object> { { "SITE", site } };
                    break;
            }
            switch (niveau)
            {
                case "Pays":
                case "services":
                case "groupes":
                case "unite":
                    filtre = $"CODE = '{code}'";
                    break;
                case "magasins":
                    filtre = $"CODE = '{code}' AND SITE = '{site}'";
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
                            }
                            break;
                        //Edition
                        default:
                            row = table.Rows[0];
                            row.BeginEdit();
                            row["LIBELLE"] = libelle;
                            row.EndEdit();
                            break;
                    }
                    // Enregistrer si la méthode existe
                    enregistrerMethod?.Invoke(tableInstance, new object[] { table });
                }
            }
            switch (statut)
            {
                //Edition
                case true:
                    result = "Enregistrement modifié avec succès";
                    break;
                //Ajout
                default:
                    if (isAllValid)
                    {
                        result = "Enregistrement ajouté avec succès";
                    }
                    else
                    {
                        result = "Code existe déjà";
                    }
                    break;
            }
            return Json(new { statut = isAllValid, message = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult DelParam(parametre objData)
        {
            string result = "";
            bool isAllValid = true;
            var code = objData.code;
            var site = objData.site;
            var niveau = objData.niveau;
            object tableInstance = null;
            string tableType = "";
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
                case "unite":
                    tableInstance = new Tables_Sto.rUnite();
                    break;
                case "magasins":
                    tableInstance = new Tables_Sto.rMagasin();
                    break;
            }
            if (tableInstance != null)
            {
                tableType = tableInstance.GetType().Name;
            }
            long totalCount = GetTotalOccurrences(niveau, code,site);
            if (totalCount > 0)
            {
                isAllValid = false;
            }
            else
            {
                string requete = "";
                switch (niveau)
                {
                    case "Pays":
                    case "services":
                    case "groupes":
                    case "unite":
                        requete = "DELETE FROM " + tableType + " where CODE = '" + code + "'";
                        break;
                    case "magasins":
                        requete = "DELETE FROM " + tableType + " where CODE = '" + code + "' and SITE = '" + site + "'";
                        break;
                }
                conn.Open();
                com.Connection = conn;
                com.CommandText = requete;
                dr = com.ExecuteReader();
                conn.Close();
            }
            if (isAllValid)
            {
                result = "Enregistrement supprimé avec succès ";
            }
            else
            {
                result = "Suppression impossible : Codification rattachée !!!";
            }
            return Json(new { statut = isAllValid, message = result }, JsonRequestBehavior.AllowGet);
        }
        private long GetTotalOccurrences(string niveau, string valueCheck,string valueCheck1)
        {
            long totalCount = 0;
            string nomColonne = "", nomColonne1 = "";
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
                case "unite":
                    nomColonne = "UNITE";
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
                case "unite":
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
            com.Parameters.AddWithValue("@code", valueCheck);
            switch (niveau)
            {
                case "magasins":
                    com.Parameters.AddWithValue("@nomColonne1", nomColonne1);
                    com.Parameters.AddWithValue("@code1", valueCheck1);
                    break;
            }
            dr = com.ExecuteReader();
            DataTable objTable = new DataTable();
            objTable.Load(dr);
            if (objTable.Rows.Count > 0 && objTable.Rows[0]["TotalOccurrences"] != DBNull.Value)
            {
                totalCount = Convert.ToInt64(objTable.Rows[0]["TotalOccurrences"]);
            }
            conn.Close();
            return totalCount;
        }
    }
}