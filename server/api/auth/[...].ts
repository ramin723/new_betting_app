import { NuxtAuthHandler } from '#auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { User } from '~/server/models/user';
import { useRuntimeConfig } from '#imports';
import type { UserModel } from '~/types/models';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';

interface CustomSession extends Session {
  user: UserModel;
}

interface CustomToken extends JWT {
  user: UserModel;
}

export default NuxtAuthHandler({
  secret: useRuntimeConfig().auth.secret,
  pages: {
    signIn: '/login'
  },
  providers: [
    // @ts-expect-error
    CredentialsProvider.default({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: { username: string; password: string }) {
        if (!credentials.username || !credentials.password) {
          throw new Error('نام کاربری و رمز عبور الزامی است');
        }

        const user = await User.findOne({ where: { username: credentials.username } });
        if (!user) {
          throw new Error('نام کاربری یا رمز عبور اشتباه است');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('نام کاربری یا رمز عبور اشتباه است');
        }

        return {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          balance: user.balance,
          avatar: user.avatar,
          commission: user.commission,
          points: user.points
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    session({ session, token }) {
      session.user = token.user as any;
      return session;
    }
  }
}); 