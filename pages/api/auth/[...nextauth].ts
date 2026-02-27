import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// Use dynamic import for CommonJS module
const getDb = () => require('../../../models');

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password harus diisi');
        }

        try {
          const db = getDb();
          
          // Find user by email with related data
          const user = await db.User.findOne({
            where: { email: credentials.email },
            include: [
              {
                model: db.Branch,
                as: 'assignedBranch',
                required: false
              },
              {
                model: db.Tenant,
                as: 'tenant',
                required: false
              }
            ]
          });

          if (!user) {
            throw new Error('Email atau password salah');
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error('Akun Anda tidak aktif. Hubungi administrator.');
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Email atau password salah');
          }

          // Update last login
          await user.update({ lastLogin: new Date() });

          // Return user object (without password)
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            businessName: user.businessName,
            tenantId: user.tenant_id,
            branchId: user.assignedBranch?.id || null,
            branchName: user.assignedBranch?.name || null,
            branchCode: user.assignedBranch?.code || null,
            tenantName: user.tenant?.name || null,
            assignedBranchId: user.assignedBranchId || null,
            kybStatus: user.tenant?.kybStatus || null,
            dataScope: user.dataScope || 'own_branch',
            businessCode: user.tenant?.businessCode || null,
            businessStructure: user.tenant?.businessStructure || 'single',
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    signOut: '/',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.businessName = user.businessName;
        token.tenantId = user.tenantId;
        token.branchId = user.branchId;
        token.branchName = user.branchName;
        token.branchCode = user.branchCode;
        token.tenantName = user.tenantName;
        token.assignedBranchId = user.assignedBranchId;
        token.kybStatus = user.kybStatus;
        token.dataScope = user.dataScope;
        token.businessCode = user.businessCode;
        token.businessStructure = user.businessStructure;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.businessName = token.businessName as string;
        session.user.tenantId = token.tenantId as string;
        session.user.branchId = token.branchId as string;
        session.user.branchName = token.branchName as string;
        session.user.branchCode = token.branchCode as string;
        session.user.tenantName = token.tenantName as string;
        session.user.assignedBranchId = token.assignedBranchId as string;
        session.user.kybStatus = token.kybStatus as string;
        session.user.dataScope = token.dataScope as string;
        session.user.businessCode = token.businessCode as string;
        session.user.businessStructure = token.businessStructure as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Check if user needs onboarding
      if (url.startsWith(baseUrl)) {
        // Allow onboarding and auth pages
        if (url.includes('/onboarding') || url.includes('/auth/') || url.includes('/admin/')) {
          return url;
        }
      }
      return baseUrl;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
