import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json(events);
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    // 실제 API와 유사하게 ID만 추가하여 반환
    return HttpResponse.json({
      event: {
        ...newEvent,
        id: crypto.randomUUID(),
      },
    });
  }),

  // PUT - 일정 수정
  http.put('/api/events/:id', async ({ request }) => {
    const updatedEvent = (await request.json()) as Event;
    return HttpResponse.json({ event: updatedEvent });
  }),

  // DELETE - 일정 삭제
  http.delete('/api/events/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
