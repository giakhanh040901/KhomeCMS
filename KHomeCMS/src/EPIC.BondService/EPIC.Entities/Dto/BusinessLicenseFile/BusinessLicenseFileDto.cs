﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EPIC.Entities.Dto.BusinessLicenseFile
{
    public class BusinessLicenseFileDto
    {
        public int Id { get; set; }
        public int BusinessCustomerId { get; set; }
        public string Title { get; set; }
        public string Url { get; set; }
        public int? Status { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string ModifiedBy { get; set; }
    }
}
