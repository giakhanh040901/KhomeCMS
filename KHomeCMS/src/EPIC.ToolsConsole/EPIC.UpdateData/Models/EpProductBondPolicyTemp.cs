﻿using System;
using System.Collections.Generic;

#nullable disable

namespace EPIC.UpdateData.Models
{
    public partial class EpProductBondPolicyTemp
    {
        public decimal BondPolicyTempId { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public decimal? Type { get; set; }
        public string InvestorType { get; set; }
        public decimal? IncomeTax { get; set; }
        public decimal? MinMoney { get; set; }
        public string Status { get; set; }
        public string IsTransfer { get; set; }
        public decimal? TransferTax { get; set; }
        public decimal? Classify { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string Deleted { get; set; }
        public decimal? TradingProviderId { get; set; }
    }
}
