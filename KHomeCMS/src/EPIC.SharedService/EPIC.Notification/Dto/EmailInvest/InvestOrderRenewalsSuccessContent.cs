﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EPIC.Notification.Dto.EmailInvest
{
    public class InvestOrderRenewalsSuccessContent
    {
        public string CustomerName { get; set; }
        public string TotalValue { get; set; }
        public string ContractCode { get; set; }
        public string ContractCodeNew { get; set; }
        public string Tenor { get; set; }
        public string NewTenor { get; set; }
        public string PaymentFullDate { get; set; }
        public string InvCode { get; set; }
        public string InvName { get; set; }
        public string PolicyName { get; set; }
        public string Profit { get; set; }
        public string TradingProviderName { get; set; }
        public string InvestDate { get; set; }
        public string DueDate { get; set; }
    }
}
