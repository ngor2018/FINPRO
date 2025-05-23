﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FINPRO.Models
{
    public class parametre
    {
        public string id { get; set; }
        public string cle { get; set; }
        public string code { get; set; }
        public string code1 { get; set; }
        public string code2 { get; set; }
        public long rowIndexB { get; set; }
        public long rowIndexP { get; set; }
        public string login { get; set; }
        public string password { get; set; }
        public string site { get; set; }
        public string sigle { get; set; }
        public string libelle { get; set; }
        public string libelleM { get; set; }
        public string nbreDecimale { get; set; }
        public string instance { get; set; }
        public string niveau { get; set; }
        public string niveauVal { get; set; }
        public string abreviation { get; set; }
        public string abreviationTitre { get; set; }
        public string PlanCorrespond { get; set; }
        public string rattachement { get; set; }
        public string format { get; set; }
        public string tabID { get; set; }
        public string titre { get; set; }
        public string typeBase { get; set; }
        public string nomServeur { get; set; }
        public string nomBase { get; set; }
        public string nomUtilisateur { get; set; }
        public string motDePasse { get; set; }
        public string versionSql { get; set; }
        public string status { get; set; }
        public string checkActif { get; set; }
        public bool cocherActif { get; set; }
        public string collectif { get; set; }
        public string gestionImmo { get; set; }
        public string budget { get; set; }
        public string acti { get; set; }
        public string geo { get; set; }
        public string fin { get; set; }
        public string plan6 { get; set; }
        public string NOIMPUTJLTRESOR { get; set; }
        public string superClasse { get; set; }
        public bool statut { get; set; }
        public bool Encours { get; set; }
        public string annee { get; set; }
        public string dateDebut { get; set; }
        public string dateFin { get; set; }
        public string dateCloture { get; set; }
        public string valeur { get; set; }
        public bool pmp { get; set; }
        public string magasin { get; set; }
        public string groupe { get; set; }
        public string famille { get; set; }
        public string service { get; set; }
        public string consommateur { get; set; }
        public string unite { get; set; }
        public string monnaie { get; set; }
        public string pays { get; set; }
        public string serie { get; set; }
        public string reference { get; set; }
        public string prixUnitaire { get; set; }
        public string codeBarre { get; set; }
        public bool serieAUTO { get; set; }
        public string codifArticle { get; set; }
        public string observation { get; set; }
        public string stockMin { get; set; }
        public string stockMax { get; set; }
        public string QteInitiale { get; set; }
        public string valInitiale { get; set; }
        public string lastPrice { get; set; }
        public string numBon { get; set; }
        public string numBl { get; set; }
        public string compte { get; set; }
        public string compteAuxi { get; set; }
        public string convention { get; set; }
        public string categorie { get; set; }
        public HttpPostedFileWrapper ImageUpload { get; set; }
        public IEnumerable<FINPRO.Models.parametre> all_parametre { get; set; }
        public IEnumerable<tabList> tabList { get; set; }
    }
}