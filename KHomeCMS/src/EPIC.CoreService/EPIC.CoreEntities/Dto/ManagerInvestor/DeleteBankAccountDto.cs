﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EPIC.CoreEntities.Dto.ManagerInvestor
{
    public class DeleteBankAccountDto
    {
        public int InvestorBankAccId { get; set; }
        public int InvestorId { get; set; }
        public int InvestorGroupId { get; set; }
        public bool IsTemp { get; set; }
    }
}
