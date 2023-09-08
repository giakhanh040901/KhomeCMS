﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EPIC.MSB.Dto.CollectMoney
{
    /// <summary>
    /// Gửi yêu cầu thu hộ
    /// </summary>
    public class RequestCollectMoneyDto
    {
        /// <summary>
        /// Tiền tố Virtual Account
        /// </summary>
        public string PrefixAccount { get; set; }

        /// <summary>
        /// Mã hợp đồng
        /// </summary>
        public string OrderCode { get; set; }

        /// <summary>
        /// Tên chủ tài khoản
        /// </summary>
        public string OwnerAccount { get; set; }

        /// <summary>
        /// Số tiền chuyển
        /// </summary>
        public decimal AmountMoney { get; set; }

        /// <summary>
        /// Ghi chú
        /// </summary>
        public string Note { get; set; }

        private string _tId;
        public string TId
        {
            get => _tId;
            set => _tId = value?.Trim();
        }
        private string _mId;
        public string MId
        {
            get => _mId;
            set => _mId = value?.Trim();
        }
    }
}
