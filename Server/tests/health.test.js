import request from 'supertest';
import app from '../src/app.js';

describe('GET /health', () => {
  it('should return 200 OK with server environment and timestamp', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Server is running');
    expect(res.body).toHaveProperty('environment');
    expect(res.body).toHaveProperty('timestamp');
  });
});
