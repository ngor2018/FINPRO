using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FINPRO.Models
{
    public class tabList
    {
        public string code { get; set; }
        public string libelle { get; set; }
        public string commentaire { get; set; }
        public string PU { get; set; }
        public string Qte { get; set; }
        public string valeur { get; set; }
        public string TVA { get; set; }
        public string montantHT { get; set; }
        public string montantTVA { get; set; }
    }
}