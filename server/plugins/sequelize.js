import { syncDatabase } from '../models/sequelize';

export default defineNitroPlugin(async () => {
    try {
        await syncDatabase();
        console.log('Database synced successfully on server start.');
    } catch (error) {
        console.error('Failed to sync database on server start:', error);
    }
});
