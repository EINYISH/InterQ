document.addEventListener('DOMContentLoaded', function () {
  const buttons = document.querySelectorAll('.sidebar-btn');
  const overlay = document.getElementById('overlay');
  const overlayBody = document.getElementById('overlay-body');
  const closeBtn = document.querySelector('.close-btn');

  const sidebarContentMap = {
    mypage: `<h3>My Page</h3><p>나의 프로필 정보와 설정을 확인하세요.</p>`,
    result: `<h3>종합 결과</h3><p>시뮬레이션에서 얻은 종합 결과를 확인하세요.</p>`,
    'video-review': `<h3>영상 다시보기</h3><p>녹화된 면접 영상을 다시 확인하세요. (분석은 제공되지 않습니다)</p>`,
    'job-competency': `<h3>직무 역량</h3><p>현재 직무 역량에 대한 분석 결과를 확인하세요.</p>`,
    faq: `<h3>FAQ</h3><p>자주 묻는 질문과 답변을 확인하세요.</p>`,
    contact: `<h3>Contact</h3><p>문의사항이 있으시면 여기로 연락하세요.</p>`,
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const contentKey = button.getAttribute('data-content');
      if (sidebarContentMap[contentKey]) {
        overlayBody.innerHTML = sidebarContentMap[contentKey];
        overlay.classList.add('show');
      }
    });
  });

  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('show');
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const shots = document.querySelectorAll('.shot');
  const shotsContainer = document.getElementById('shots-container');

  const shotsContentMap = {
    shot1: `<div class="card"><h3>나의 면접 질문</h3><p>이곳에서 주요 질문을 확인하세요.</p></div>`,
    shot2: `<div class="card"><h3>시뮬레이션 기록</h3><p>최근 기록을 확인하세요.</p></div>`,
    shot3: `<div class="card"><h3>도전 과제</h3><p>도전 과제를 설정하고 달성하세요.</p></div>`,
  };

  function getRandomQuestions() {
    const shuffled = aiQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  }

  function updateAIQuestions() {
    const questions = getRandomQuestions();
    let content = `
        <div class="card">
          <h3>AI 면접 질문</h3>
          <ul>
      `;
    questions.forEach((q) => {
      content += `<li>${q}</li>`;
    });
    content += `
          </ul>
          <button id="refresh-btn" class="edit-btn">새로운 질문 받기</button>
        </div>
      `;
    shotsContainer.innerHTML = content;
    shotsContainer.style.display = 'block';

    document
      .getElementById('refresh-btn')
      .addEventListener('click', updateAIQuestions);
  }

  shots.forEach((shot) => {
    shot.addEventListener('click', () => {
      const contentKey = shot.getAttribute('data-shot');
      if (contentKey === 'shot4') {
        updateAIQuestions(); // AI 면접 질문 표시
      } else if (shotsContentMap[contentKey]) {
        shotsContainer.innerHTML = shotsContentMap[contentKey];
        shotsContainer.style.display = 'block';
      } else {
        shotsContainer.innerHTML = '<p>해당 콘텐츠를 찾을 수 없습니다.</p>';
        shotsContainer.style.display = 'block';
      }
    });
  });
});

//FAQ
document.addEventListener('DOMContentLoaded', function () {
  const faqButton = document.querySelector('[data-content="faq"]');
  const overlay = document.getElementById('overlay');
  const overlayBody = document.getElementById('overlay-body');
  const closeBtn = document.querySelector('.close-btn');

  if (faqButton) {
    faqButton.addEventListener('click', () => {
      overlayBody.innerHTML = `
        <h2>FAQ - 면접 AI 시뮬레이션</h2>
        <div class="faq-container">
          <div class="faq-item">
            <button class="faq-question">면접 질문은 어떻게 구성되나요?</button>
            <div class="faq-answer">면접은 5분 동안 총 10개의 질문으로 구성됩니다.</div>
            <div class="faq-answer">면접은 1분 동안 총 2개의 질문으로 사용자에게 제공됩니다.</div>
          </div>
          <div class="faq-item">
            <button class="faq-question">면접 피드백은 어떤 기준으로 제공되나요?</button>
            <div class="faq-answer">답변 내용과 직무 역량을 기준으로 종합 결과를 제공합니다.</div>
          </div>
          <div class="faq-item">
            <button class="faq-question">면접 질문은 매번 달라지나요?</button>
            <div class="faq-answer">네, AI가 사용자의 이력서를 기반으로 매번 새로운 질문이 랜덤으로 제공됩니다.</div>
          </div>
          <div class="faq-item">
            <button class="faq-question">면접 결과는 어떻게 저장되나요?</button>
            <div class="faq-answer">면접이 끝난 후, 사용자의 기록이 저장되어 추후 다시 확인할 수 있습니다.</div>
          </div>
          <div class="faq-item">
            <button class="faq-question">면접 영상은 어떻게 활용되나요?</button>
            <div class="faq-answer">면접 영상은 AI가 분석하지 않으며, 본인이 다시 보며 스스로 점검할 수 있도록 저장됩니다.</div>
          </div>
          <div class="faq-item">
            <button class="faq-question">면접이 끝난 후 피드백을 다시 볼 수 있나요?</button>
            <div class="faq-answer">네, 사용자는 자신의 면접 기록을 다시 확인할 수 있으며, 피드백을 분석하여 개선할 수 있습니다.</div>
          </div>
          <div class="faq-item">
            <button class="faq-question">AI 면접과 실제 면접의 차이는 무엇인가요?</button>
            <div class="faq-answer">AI 면접은 자동 분석을 통해 객관적인 피드백을 제공하며, 반복 연습이 가능합니다. 실제 면접은 추가적인 상호작용이 포함됩니다.</div>
          </div>
          <div class="faq-item">
            <button class="faq-question">면접 결과를 다른 사람과 공유할 수 있나요?</button>
            <div class="faq-answer">현재는 개인 기록으로만 저장되지만, 향후 피드백을 공유할 수 있는 기능이 추가될 예정입니다.</div>
          </div>
          <div class="faq-item">
            <button class="faq-question">면접 시 AI는 어떤 요소를 중요하게 평가하나요?</button>
            <div class="faq-answer">AI는 답변 내용의 논리성과 직무 역량을 종합적으로 평가합니다.</div>
           </div>
        </div>
      `;
      overlay.classList.add('show');

      // FAQ 버튼 클릭 시 답변 보이게 하기
      document.querySelectorAll('.faq-question').forEach((question) => {
        question.addEventListener('click', function () {
          this.nextElementSibling.classList.toggle('show-answer');
        });
      });
    });
  }

  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('show');
  });
});

//Contact
document.addEventListener('DOMContentLoaded', function () {
  const contactButton = document.querySelector('[data-content="contact"]');
  const overlay = document.getElementById('overlay');
  const overlayBody = document.getElementById('overlay-body');
  const closeBtn = document.querySelector('.close-btn');

  if (contactButton) {
    contactButton.addEventListener('click', () => {
      overlayBody.innerHTML = `
        <h2>Contact - 문의하기</h2>
        <div class="contact-container">
          <p>면접 AI 시뮬레이션 관련 문의가 있으시면 아래 정보를 통해 연락해 주세요.</p>
          <ul>
            <li><strong>문의처:</strong>https://www.sungkyul.ac.kr/computer/index.do</li>
            <li><strong>전화번호:</strong> 02-1234-5678</li>
            <li><strong>운영 시간:</strong> 월-금 09:00 ~ 18:00</li>
            <li><strong>문의처:</strong> 성결대학교/컴퓨터공학과/짬뽕밥</li>
          </ul>
          <h3>문의 남기기</h3>
          <textarea id="contactMessage" placeholder="문의 내용을 입력하세요..." rows="4"></textarea>
          <button id="sendContactMessage">문의 보내기</button>
        </div>
      `;
      overlay.classList.add('show');

      // 문의 보내기 버튼 기능 추가
      document.getElementById('sendContactMessage').addEventListener('click', function () {
        const message = document.getElementById('contactMessage').value;
        if (message.trim() === '') {
          alert("문의 내용을 입력해주세요.");
          return;
        }
        alert("문의가 성공적으로 접수되었습니다!");
        document.getElementById('contactMessage').value = ""; // 입력창 초기화
      });
    });
  }

  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('show');
  });
});

//도전과제
document.addEventListener('DOMContentLoaded', function () {
  const shotsContainer = document.getElementById('shots-container');
  const shots = document.querySelectorAll('.shot');

  const challengeContent = `
    <h2>도전 과제</h2>
    <div class="challenge-container">
      ${generateChallenges()} <!-- 도전 과제 HTML 생성 -->
    </div>
  `;

  // My Shots 클릭 이벤트 (shot3 클릭 시 도전 과제 표시)
  shots.forEach((shot) => {
    shot.addEventListener('click', () => {
      const contentKey = shot.getAttribute('data-shot');
      if (contentKey === 'shot3') {
        shotsContainer.innerHTML = challengeContent;
        shotsContainer.classList.add('active');
      }
    });
  });

  // 도전 과제 HTML 생성 함수
  function generateChallenges() {
    const challenges = [
      "첫 번째 면접 완료하기",
      "3번의 면접 도전",
      "5번의 면접 도전",
      "첫 번째 피드백 확인",
      "영상 다시보기로 복기하기",
      "직무역량 분석 받기",
      "면접 질문 복기하기",
      "마이페이지에서 도전과제 확인",
      "모든 도전 과제 완료"
    ];
    let html = '';
    challenges.forEach((challenge, index) => {
      html += `
        <div class="challenge-item" id="challenge-${index + 1}">
          <div class="challenge-medal"></div>
          <p class="challenge-text">${challenge}</p>
        </div>
      `;
    });
    return html;
  }
});
