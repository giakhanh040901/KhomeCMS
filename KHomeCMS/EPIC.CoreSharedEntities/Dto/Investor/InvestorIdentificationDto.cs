﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EPIC.CoreSharedEntities.Dto.Investor
{
    public class InvestorIdentificationDto
    {
		public int Id { get; set; }
		public int InvestorId { get; set; }
		public string IdType { get; set; }
		public string IdNo { get; set; }
		public string Fullname { get; set; }
		public DateTime? DateOfBirth { get; set; }
		public string Nationality { get; set; }
		public string PersonalIdentification { get; set; }
		public string IdIssuer { get; set; }
		public DateTime? IdDate { get; set; }
		public DateTime? IdExpiredDate { get; set; }
		public string PlaceOfOrigin { get; set; }
		public string PlaceOfResidence { get; set; }
		public string IdFrontImageUrl { get; set; }
		public string IdBackImageUrl { get; set; }
		public string IdExtraImageUrl { get; set; }
		public string FaceImageUrl { get; set; }
		public string FaceVideoUrl { get; set; }
		public string Status { get; set; }
		public string IsDefault { get; set; }
		public string IsVerifiedFace { get; set; }
		public string IsVerifiedIdentification { get; set; }
		public string StatusApproved { get; set; }
		public string InvestorGroupId { get; set; }
		public DateTime? CreatedDate { get; set; }
		public string CreatedBy { get; set; }
		public DateTime? ModifiedDate { get; set; }
		public string ModifiedBy { get; set; }
		public string Deleted { get; set; }
		public string Sex { get; set; }
		public string EkycIncorrectFields { get; set; }
		public string EkycInfoIsConfirmed { get; set; }
	}
}
