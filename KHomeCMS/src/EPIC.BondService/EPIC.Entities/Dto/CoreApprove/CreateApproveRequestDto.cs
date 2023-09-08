﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EPIC.Entities.Dto.CoreApprove
{
    public class CreateApproveRequestDto
    {
        public int UserRequestId { get; set; }
        public int? UserApproveId { get; set; }
        public string RequestNote { get; set; }
        public int ActionType { get; set; }
        public int DataType { get; set; }
        public int ReferId { get; set; }
        public int ReferIdTemp { get; set; }
        public int DataStatus { get; set; }
        public string DataStatusStr { get; set; }
        public string Summary { get; set; }
        public string ApproveRequestFileUrl { get; set; }
    }

    public class RequestStatusDto
    {
        /// <summary>
        /// Refer Id
        /// </summary>
        public int Id { get; set; }
        public int? UserApproveId { get; set; }
        public string RequestNote { get; set; }
        public int DataStatus { get; set; }
        public string DataStatusStr { get; set; }
        public string Summary { get; set; }
    }

}