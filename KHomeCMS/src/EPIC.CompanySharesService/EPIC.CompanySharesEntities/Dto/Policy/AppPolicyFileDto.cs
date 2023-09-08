﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EPIC.CompanySharesEntities.Dto.Policy
{
    public class AppPolicyFileDto
    {
        public int PolicyFileId { get; set; }
        public string Name { get; set; }
        public string Url { get; set; }
        public DateTime? EffectiveDate { get; set; }
        public DateTime? ExpirationDate { get; set; }
    }
}
