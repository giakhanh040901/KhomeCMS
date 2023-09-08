﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace EPIC.Utils.Security
{
    public static class CryptographyUtils
    {
        /// <summary>
        /// Tính toán hash SHA 256
        /// </summary>
        /// <param name="values"></param>
        /// <returns></returns>
        public static string ComputeSha256Hash(params string[] values)
        {
            string rawData = string.Join("", values);
            SHA256 sha256Hash = SHA256.Create();
            byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            return Convert.ToHexString(bytes);
        }

        /// <summary>
        /// Tính toán hash MD5
        /// </summary>
        /// <param name="values"></param>
        /// <returns></returns>
        public static string ComputeMD5(params string[] values)
        {
            string rawData = string.Join("", values);
            MD5 md5 = System.Security.Cryptography.MD5.Create();
            byte[] inputBytes = Encoding.UTF8.GetBytes(rawData);
            byte[] hashBytes = md5.ComputeHash(inputBytes);
            return Convert.ToHexString(hashBytes);
        }

        public static (string, string) CreateAES()
        {
            Aes myAes = Aes.Create();
            return (Convert.ToHexString(myAes.Key), Convert.ToHexString(myAes.IV));
        }

        /// <summary>
        /// Mã hoá AES
        /// </summary>
        /// <param name="plainText"></param>
        /// <param name="keyHex"></param>
        /// <param name="IVHex"></param>
        /// <returns></returns>
        public static string EncryptString_Aes(string plainText, string keyHex, string IVHex)
        {
            byte[] result = EncryptStringToBytes_Aes(plainText, Convert.FromHexString(keyHex), Convert.FromHexString(IVHex));
            return Convert.ToHexString(result);
        }

        /// <summary>
        /// Giải mã AES
        /// </summary>
        /// <param name="cipherTextHex"></param>
        /// <param name="keyHex"></param>
        /// <param name="IVHex"></param>
        /// <returns></returns>
        public static string DecryptString_Aes(string cipherTextHex, string keyHex, string IVHex)
        {
            return DecryptStringFromBytes_Aes(Convert.FromHexString(cipherTextHex), Convert.FromHexString(keyHex), Convert.FromHexString(IVHex));
        }

        public static byte[] EncryptStringToBytes_Aes(string plainText, byte[] Key, byte[] IV)
        {
            // Check arguments.
            if (plainText == null || plainText.Length <= 0)
                throw new ArgumentNullException(nameof(plainText));
            if (Key == null || Key.Length <= 0)
                throw new ArgumentNullException(nameof(Key));
            if (IV == null || IV.Length <= 0)
                throw new ArgumentNullException(nameof(IV));
            byte[] encrypted;

            // Create an Aes object
            // with the specified key and IV.
            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = Key;
                aesAlg.IV = IV;

                // Create an encryptor to perform the stream transform.
                ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

                // Create the streams used for encryption.
                using MemoryStream msEncrypt = new();
                using CryptoStream csEncrypt = new(msEncrypt, encryptor, CryptoStreamMode.Write);
                using (StreamWriter swEncrypt = new(csEncrypt))
                {
                    //Write all data to the stream.
                    swEncrypt.Write(plainText);
                }
                encrypted = msEncrypt.ToArray();
            }

            // Return the encrypted bytes from the memory stream.
            return encrypted;
        }

        public static string DecryptStringFromBytes_Aes(byte[] cipherText, byte[] Key, byte[] IV)
        {
            // Check arguments.
            if (cipherText == null || cipherText.Length <= 0)
                throw new ArgumentNullException(nameof(cipherText));
            if (Key == null || Key.Length <= 0)
                throw new ArgumentNullException(nameof(Key));
            if (IV == null || IV.Length <= 0)
                throw new ArgumentNullException(nameof(IV));

            // Declare the string used to hold
            // the decrypted text.
            string plaintext = null;

            // Create an Aes object
            // with the specified key and IV.
            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = Key;
                aesAlg.IV = IV;

                // Create a decryptor to perform the stream transform.
                ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

                // Create the streams used for decryption.
                using MemoryStream msDecrypt = new(cipherText);
                using CryptoStream csDecrypt = new(msDecrypt, decryptor, CryptoStreamMode.Read);
                using StreamReader srDecrypt = new(csDecrypt);

                // Read the decrypted bytes from the decrypting stream
                // and place them in a string.
                plaintext = srDecrypt.ReadToEnd();
            }

            return plaintext;
        }

        public static object ComputeSha256Hash(object accessCode, string requestId, string id, string mId)
        {
            throw new NotImplementedException();
        }
    }
}