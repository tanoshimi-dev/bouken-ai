import { prisma } from '../lib/prisma.js';
import { signAccessToken } from '../lib/jwt.js';
import app from '../app.js';

const TEST_USER_PREFIX = '__e2e_test_';

export interface TestContext {
  userId: string;
  accessToken: string;
}

/**
 * Create a test user directly in the DB and generate a JWT for it.
 */
export async function createTestUser(): Promise<TestContext> {
  const name = `${TEST_USER_PREFIX}${Date.now()}`;
  const email = `${name}@test.local`;

  const user = await prisma.user.create({
    data: { name, email },
  });

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email ?? undefined,
    name: user.name,
  });

  return { userId: user.id, accessToken };
}

/**
 * Remove the test user and all cascading data.
 */
export async function cleanupTestUser(userId: string): Promise<void> {
  await prisma.user.delete({ where: { id: userId } }).catch(() => {
    // Ignore if already deleted
  });
}

/**
 * Make an authenticated request to the Hono app via app.request().
 */
export async function authRequest(
  method: string,
  path: string,
  token: string,
  body?: unknown,
): Promise<Response> {
  const headers: Record<string, string> = {
    Cookie: `access_token=${token}`,
  };

  const init: RequestInit = { method, headers };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  return app.request(path, init);
}
