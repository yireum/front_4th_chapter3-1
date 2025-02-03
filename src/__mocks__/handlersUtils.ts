import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  // 테스트 격리를 위해 각 테스트마다 새로운 events 배열을 생성
  let events = [...initEvents];

  // MSW 서버에 새로운 핸들러를 등록
  server.use(
    // GET 요청 핸들러: 현재 상태의 events 배열을 반환
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    // POST 요청 핸들러: 새로운 일정을 추가하고 업데이트된 상태 반환
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      const eventWithId = {
        ...newEvent,
        id: crypto.randomUUID(),
      };
      events.push(eventWithId); // 로컬 상태 업데이트
      return HttpResponse.json({ event: eventWithId }, { status: 201 });
    })
  );

  // 테스트에서 상태 확인을 위해 events 배열 반환
  return { events };
};

// 일정 수정 관련 테스트를 위한 모의 핸들러 설정
export const setupMockHandlerUpdating = () => {
  let events: Event[] = [];

  server.use(
    // GET 요청 핸들러: 현재 상태 반환
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    // PUT 요청 핸들러: 기존 일정 수정
    http.put('/api/events/:id', async ({ params, request }) => {
      const updatedEvent = (await request.json()) as Event;
      const { id } = params;

      const eventIndex = events.findIndex((event) => event.id === id);
      if (eventIndex === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      events[eventIndex] = updatedEvent; // 로컬 상태 업데이트
      return HttpResponse.json({ event: updatedEvent });
    })
  );

  return { events };
};

// 일정 삭제 관련 테스트를 위한 모의 핸들러 설정
export const setupMockHandlerDeletion = () => {
  let events: Event[] = [];

  server.use(
    // GET 요청 핸들러: 현재 상태 반환
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    // DELETE 요청 핸들러: 일정 삭제
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const eventIndex = events.findIndex((event) => event.id === id);

      if (eventIndex === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      events = events.filter((event) => event.id !== id); // 로컬 상태 업데이트
      return new HttpResponse(null, { status: 204 });
    })
  );

  return { events };
};
