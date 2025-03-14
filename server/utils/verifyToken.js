import jwt from 'jsonwebtoken';

/**
 * تایید اعتبار توکن JWT
 * @param {string} token - توکن JWT
 * @param {string} secret - کلید رمزنگاری
 * @returns {Promise<Object>} - اطلاعات decode شده توکن
 */
export const verifyToken = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}; 