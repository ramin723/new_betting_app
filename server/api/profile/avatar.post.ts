import { verifyToken } from '~/server/utils/jwt';
import { User } from '~/server/models/User';
import { uploadToS3 } from '~/server/utils/s3';

export default defineEventHandler(async (event) => {
  try {
    // دریافت توکن از هدر
    const token = event.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      throw createError({
        statusCode: 401,
        message: 'توکن احراز هویت یافت نشد'
      });
    }

    // اعتبارسنجی توکن
    const decoded = verifyToken(token);
    
    // دریافت فایل از درخواست
    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'فایلی ارسال نشده است'
      });
    }

    const file = formData[0];
    const contentType = file.type || 'image/jpeg';
    
    if (!contentType.startsWith('image/')) {
      throw createError({
        statusCode: 400,
        message: 'فایل ارسالی باید تصویر باشد'
      });
    }

    // آپلود فایل به S3
    const avatarUrl = await uploadToS3(file.data, `avatars/${decoded.id}/${Date.now()}-${file.filename}`, contentType);

    // به‌روزرسانی آدرس تصویر در پروفایل کاربر
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'کاربر یافت نشد'
      });
    }

    await user.update({ avatar: avatarUrl });

    return {
      message: 'تصویر پروفایل با موفقیت به‌روزرسانی شد',
      avatar: avatarUrl
    };
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      throw createError({
        statusCode: 401,
        message: 'توکن نامعتبر است'
      });
    }
    
    throw createError({
      statusCode: 500,
      message: 'خطا در آپلود تصویر پروفایل'
    });
  }
}); 