// server/api/bets/index.post.js
import { Bet, User, Event } from '../../models/database';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { user_id, event_id, bet_option, bet_amount } = body;

  if (!user_id || !event_id || !bet_option || !bet_amount) {
    throw createError({
      statusCode: 400,
      message: 'تمامی اطلاعات الزامی هستند.',
    });
  }

  try {
    const user = await User.findByPk(user_id);
    const event = await Event.findByPk(event_id);

    if (!user || !event || event.status !== 'active') {
      throw createError({
        statusCode: 400,
        message: 'کاربر یا رویداد معتبر نیست.',
      });
    }

    if (user.balance < bet_amount) {
      throw createError({
        statusCode: 400,
        message: 'موجودی کافی نیست.',
      });
    }

    user.balance -= bet_amount;
    await user.save();

    const bet = await Bet.create({
      user_id,
      event_id,
      bet_option,
      bet_amount,
      status: 'active',
    });

    return { success: true, message: 'شرط‌بندی با موفقیت ثبت شد.', bet };
  } catch (error) {
    console.error('Error placing bet:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در ثبت شرط‌بندی.',
    });
  }
});
