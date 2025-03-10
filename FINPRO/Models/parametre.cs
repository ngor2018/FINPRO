using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FINPRO.Models
{
    public class parametre
    {
        public string id { get; set; }
        public string code { get; set; }
        public string login { get; set; }
        public string password { get; set; }
        public string sigle { get; set; }
        public string libelle { get; set; }
        public string niveau { get; set; }
        public string abreviation { get; set; }
        public string abreviationTitre { get; set; }
        public string format { get; set; }
        public string titre { get; set; }
        public string typeBase { get; set; }
        public string nomServeur { get; set; }
        public string nomBase { get; set; }
        public string nomUtilisateur { get; set; }
        public string motDePasse { get; set; }
        public string versionSql { get; set; }
        public bool statut { get; set; }
        public HttpPostedFileWrapper ImageUpload { get; set; }
        public IEnumerable<FINPRO.Models.parametre> all_parametre { get; set; }
    }
}