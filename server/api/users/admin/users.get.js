import { User } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { search, sort_by = 'createdAt', order = 'DESC', limit = 10, page = 1 } = query;

  const whereClause = search ? { username: { [Op.like]: `%${search}%` } } : {};

  const users = await User.findAndCountAll({
    where: whereClause,
    order: [[sort_by, order]],
    limit: parseInt(limit),
    offset: (page - 1) * parseInt(limit),
    attributes: ['id', 'username', 'balance', 'createdAt', 'updatedAt'],
  });

  return {
    success: true,
    users: users.rows,
    total: users.count,
    pages: Math.ceil(users.count / limit),
    currentPage: parseInt(page),
  };
});
