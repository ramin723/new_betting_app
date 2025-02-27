import { Event, Bet, PendingCommission, User, EventReferral } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const eventId = event.context.params.id;
  const body = await readBody(event);
  const { winning_option } = body; // گزینه‌ی برنده (اگر موجود باشد)

  // دریافت اطلاعات رویداد
  const eventData = await Event.findByPk(eventId);
  if (!eventData) {
    throw createError({ statusCode: 404, message: 'رویداد یافت نشد.' });
  }
  // بررسی اینکه گزینه‌ی برنده معتبر است
  if (winning_option && winning_option !== eventData.option_1 && winning_option !== eventData.option_2) {
  throw createError({ statusCode: 400, message: 'گزینه‌ی برنده نامعتبر است.' });
  }
  if (eventData.status === 'closed') {
    throw createError({ statusCode: 400, message: 'این رویداد قبلاً بسته شده است.' });
  }

  console.log(`🚀 بستن رویداد ${eventId} و پردازش کمیسیون‌ها...`);

  // مقدار کل استخر شرط‌بندی
  const totalPool = eventData.total_pool;
  if (totalPool <= 0) {
    throw createError({ statusCode: 400, message: 'رویداد هیچ شرط‌بندی‌ای نداشته است.' });
  }

  // **۱. محاسبه‌ی کمیسیون‌ها**
  const commissionTotal = totalPool * 0.15;
  const creatorCommission = totalPool * 0.02; // ۲٪ کمیسیون سازنده‌ی رویداد
  const referralCommission = totalPool * 0.05; // ۵٪ کمیسیون دعوت‌کنندگان
  const siteCommission = commissionTotal - (eventData.creator_id ? creatorCommission : 0); // سهم سایت

  // توزیع کمیسیون به سازنده‌ی رویداد
  if (eventData.creator_id) {
    const creator = await User.findByPk(eventData.creator_id);
    if (creator) {
      creator.balance += creatorCommission;
      await creator.save();
      console.log(`✅ کمیسیون ${creatorCommission} برای سازنده‌ی رویداد (${creator.id}) پرداخت شد.`);
    }
  } else {
    console.log(`✅ کمیسیون ${creatorCommission} به حساب سایت اضافه شد.`);
  }

  // پرداخت کمیسیون‌های دعوت‌کنندگان
  const commissions = await PendingCommission.findAll({ where: { event_id: eventId, status: 'pending' } });
  for (const commission of commissions) {
    const recipient = await User.findByPk(commission.user_id);
    if (recipient) {
      recipient.balance += commission.amount;
      await recipient.save();
      commission.status = 'paid';
      await commission.save();
      console.log(`✅ کمیسیون ${commission.amount} برای کاربر ${recipient.id} پرداخت شد.`);
    }
  }

  // **۲. تعیین برنده و توزیع جوایز**
  if (winning_option) {
    console.log(`🏆 گزینه‌ی برنده‌ی رویداد ${eventId}: ${winning_option}`);

    // دریافت شرط‌های برنده
    const winningBets = await Bet.findAll({ where: { event_id: eventId, bet_option: winning_option } });

    if (winningBets.length === 0) {
      console.log('❌ هیچ کاربری روی گزینه‌ی برنده شرط نبسته است. فقط کمیسیون‌ها پردازش خواهند شد.');
    } else {
      const totalWinningBets = winningBets.reduce((sum, bet) => sum + bet.bet_amount, 0);
      const prizePool = totalPool - commissionTotal; // مبلغ باقی‌مانده پس از کسر کمیسیون‌ها

      for (const bet of winningBets) {
        const winner = await User.findByPk(bet.user_id);
        if (winner) {
          const winAmount = (bet.bet_amount / totalWinningBets) * prizePool;
          winner.balance += winAmount;
          await winner.save();
          console.log(`🏆 مبلغ ${winAmount.toFixed(2)} به کاربر ${winner.id} پرداخت شد.`);
        }
      }
    }
  } else {
    console.log(`⚠️ رویداد ${eventId} بدون برنده بسته شد. پردازش بازگشت وجوه...`);

    // بازگشت ۹۳٪ مبلغ به کاربران (۲٪ سهم سایت و ۵٪ سهم کاربران در اپ جانبی)
    const totalRefund = totalPool * 0.93;
    const bets = await Bet.findAll({ where: { event_id: eventId } });

    for (const bet of bets) {
      const bettor = await User.findByPk(bet.user_id);
      if (bettor) {
        const refundAmount = (bet.bet_amount / totalPool) * totalRefund;
        bettor.balance += refundAmount;
        await bettor.save();
        console.log(`🔄 بازگشت مبلغ ${refundAmount.toFixed(2)} به کاربر ${bettor.id}`);
      }
    }
  }

  // تغییر وضعیت رویداد به `closed`
  eventData.status = 'closed';
  await eventData.save();

  return { success: true, message: `رویداد ${eventId} بسته شد، کمیسیون‌ها پرداخت شدند، و جوایز تسویه شد.` };
});
