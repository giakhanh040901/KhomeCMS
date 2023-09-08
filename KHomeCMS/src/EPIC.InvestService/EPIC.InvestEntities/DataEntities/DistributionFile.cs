﻿using EPIC.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EPIC.InvestEntities.DataEntities
{
    public class DistributionFile : IFullAudited
    {
        public int? Id { get; set; }
        public int? DistributionId { get; set; }
        public string Title { get; set; }
        public string FileUrl { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string ModifiedBy { get; set; }
        public string Deleted { get; set; }
    }

}
