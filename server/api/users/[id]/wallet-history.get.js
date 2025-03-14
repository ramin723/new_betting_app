// server/api/users/[id]/wallet-history.get.js
import { User, WalletHistory, Transaction, sequelize } from '../../../models/database';
import { checkResourceAccess, requireAdmin } from '../../../middleware/access-control';import { handleApiError } from '../../../utils/error-handler';
import { createPaginatedResponse } from '../../../utils/response';
import { defineEventHandler, createError, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    // اعمال middleware ها
    await useAuth(event);
    await checkResourceAccess(event);

    const userId = event.context.params.id;
    const query = getQuery(event);

    // پارامترهای فیلتر و صفحه‌بندی
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.page_size) || 20;
    const type = query.type || null; // deposit, withdraw, bet, win, commission
    const status = query.status || null; // pending, completed, failed
    const startDate = query.start_date ? new Date(query.start_date) : null;
    const endDate = query.end_date ? new Date(query.end_date) : null;
    const sortOrder = query.sort_order === 'asc' ? 'ASC' : 'DESC';

    // ساخت شرط‌های جستجو
    const whereClause = {
      user_id: userId
    };

    if (type) {
      whereClause.type = type;
    }
    if (status) {
      whereClause.status = status;
    }
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) {
        whereClause.created_at[sequelize.Op.gte] = startDate;
      }
      if (endDate) {
        whereClause.created_at[sequelize.Op.lte] = endDate;
      }
    }

    // دریافت تاریخچه با جزئیات
    const { count, rows } = await WalletHistory.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Transaction,
          attributes: [
            'tx_hash',
            'block_number',
            'confirmation_count',
            'ton_amount',
            'usd_amount'
          ]
        }
      ],
      attributes: [
        'id',
        'type',
        'status',
        'amount',
        'old_balance',
        'new_balance',
        'description',
        'created_at',
        'wallet_address',
        'event_id',
        'bet_id',
        [
          sequelize.literal(`CASE 
            WHEN type = 'deposit' THEN amount 
            WHEN type = 'win' THEN amount
            ELSE 0 
          END`),
          'credit'
        ],
        [
          sequelize.literal(`CASE 
            WHEN type = 'withdraw' THEN amount 
            WHEN type = 'bet' THEN amount
            ELSE 0 
          END`),
          'debit'
        ]
      ],
      order: [['created_at', sortOrder]],
      offset: (page - 1) * pageSize,
      limit: pageSize
    });

    // محاسبه آمار کلی
    const stats = await WalletHistory.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('SUM', sequelize.literal(`CASE 
          WHEN type = 'deposit' THEN amount 
          WHEN type = 'win' THEN amount
          ELSE 0 
        END`)), 'total_credit'],
        [sequelize.fn('SUM', sequelize.literal(`CASE 
          WHEN type = 'withdraw' THEN amount 
          WHEN type = 'bet' THEN amount
          ELSE 0 
        END`)), 'total_debit'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_transactions']
      ]
    });

    // تبدیل نتایج به فرمت مناسب
    const formattedHistory = rows.map(record => ({
      id: record.id,
      type: record.type,
      status: record.status,
      amount: {
        value: record.amount,
        credit: record.getDataValue('credit'),
        debit: record.getDataValue('debit')
      },
      balance: {
        before: record.old_balance,
        after: record.new_balance
      },
      blockchain_data: record.Transaction ? {
        tx_hash: record.Transaction.tx_hash,
        block_number: record.Transaction.block_number,
        confirmations: record.Transaction.confirmation_count,
        ton_amount: record.Transaction.ton_amount,
        usd_amount: record.Transaction.usd_amount
      } : null,
      metadata: {
        wallet_address: record.wallet_address,
        event_id: record.event_id,
        bet_id: record.bet_id
      },
      description: record.description,
      timestamp: record.created_at
    }));

    // آماده‌سازی آمار
    const summary = {
      total_credit: parseFloat(stats[0].getDataValue('total_credit') || 0),
      total_debit: parseFloat(stats[0].getDataValue('total_debit') || 0),
      total_transactions: parseInt(stats[0].getDataValue('total_transactions')),
      net_balance: parseFloat(stats[0].getDataValue('total_credit') || 0) - 
                  parseFloat(stats[0].getDataValue('total_debit') || 0)
    };

    // برگرداندن پاسخ با صفحه‌بندی و آمار
    return createPaginatedResponse(
      formattedHistory,
      count,
      page,
      pageSize,
      'تاریخچه تراکنش‌ها با موفقیت دریافت شد.',
      { summary }
    );

  } catch (error) {
    return handleApiError(error, 'fetching wallet history');
  }
});
