
import { io, Socket } from 'socket.io-client';
import fetch from 'node-fetch';

const BASE = process.env.TEST_SERVER_URL || 'http://localhost:3000';
const TEST_USER_ID = Number(process.env.TEST_USER_ID || 1);
const TEST_ORDER_ID = Number(process.env.TEST_ORDER_ID || 1);

(global as any).fetch = fetch;

describe('WebSocket: order status updates', () => {
  let socket: Socket;

  beforeAll((done) => {
    socket = io(BASE, { transports: ['websocket'], reconnection: true });

    socket.on('connect', () => {
      socket.emit('join_user', TEST_USER_ID);
      // give server a short moment to join the room
      setTimeout(done, 200);
    });

    socket.on('connect_error', (err: any) => done(new Error(`Socket connect_error: ${err}`)));
  }, 10000);

  afterAll(() => {
    if (socket && socket.connected) socket.disconnect();
  });

  it('receives order_status_updated when order status changes', (done) => {
    // wait for the socket event
    socket.once('order_status_updated', (payload: any) => {
      try {
        expect(payload).toBeDefined();
        expect(payload).toHaveProperty('orderId', TEST_ORDER_ID);
        expect(typeof payload.status).toBe('string');
        done();
      } catch (err) {
        done(err as Error);
      }
    });

    // trigger status change via HTTP PUT
    const url = `${BASE}/api/orders/${TEST_ORDER_ID}`;
    fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} when updating order`);
        // HTTP succeeded — event should follow
      })
      .catch((err) => done(err));

    // fail if no event within 8s
    setTimeout(() => done(new Error('No order_status_updated event received within timeout')), 8000);
  }, 15000);
});