﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EPIC.PaymentEntities.Dto.MsbRequestPayment
{
    public class UpdateMsbRequestPaymentDto : CreateMsbRequestPaymentDto
    {
        public long Id { get; set; }
    }
}
