import request from 'supertest';
import app from '../src/app.js';

describe('Public Services API Integration', () => {
  it('GET /api/v1/services should return 200 with paginated data structure', async () => {
    const res = await request(app).get('/api/v1/services');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('pagination');
  });

  it('GET /api/v1/services/featured should return 200 with featured items array', async () => {
    const res = await request(app).get('/api/v1/services/featured');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/services/slug/non-existent-slug should return 404', async () => {
    const res = await request(app).get('/api/v1/services/slug/non-existent-slug-12345');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/services/507f1f77bcf86cd799439011 (non-existent valid ObjectId) should return 404', async () => {
    const res = await request(app).get('/api/v1/services/507f1f77bcf86cd799439011');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
