﻿using EPIC.EntitiesBase.Dto;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EPIC.GarnerEntities.Dto.GarnerContractTemplateTemp
{
    public class FilterGarnerContractTemplateTempDto : PagingRequestBaseDto
    {
        [FromQuery(Name = "contractSource")]
        public int? ContractSource { get; set; }

        [FromQuery(Name = "contractType")]
        public int? ContractType { get; set; }

        private string _status;
        public string Status
        {
            get => _status;
            set => _status = value?.Trim();
        }
    }
}
