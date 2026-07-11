// question-generator.js

// 입력값 수집 함수
function collectResumeData() {
  return {
    name: document.getElementById('name').value.trim(),
    university: document.getElementById('university').value.trim(),
    educationLevel: document.getElementById('education-level').value.trim(),
    graduationDate: document.getElementById('graduation-date').value.trim(),
    workExperience: document.getElementById('work-experience').value.trim(),
    jobRoles: document.getElementById('job-roles').value.trim(),
    projects: document.getElementById('projects').value.trim(),
    technicalSkills: document.getElementById('technical-skills').value.trim(),
    certifications: document.getElementById('certifications').value.trim(),
    languageProficiency: document.getElementById('language-proficiency').value.trim(),
    careerGoals: document.getElementById('career-goals').value.trim(),
    desiredField: document.getElementById('desired-field').value.trim(),
    desiredPosition: document.getElementById('desired-position').value.trim(),
    selfIntroduction: document.getElementById('self-introduction').value.trim(),
    birthday: document.getElementById('birthday').value.trim(),
    contactInformation: document.getElementById('contact-information').value.trim()
  };
}

// GPT API 요청 함수
async function generateInterviewQuestions() {
  const submitButton = document.getElementById('submit-button');
  if (!submitButton) {
    console.error('❌ submit-button을 찾을 수 없습니다.');
    return;
  }

  const resumeData = collectResumeData();

  // ✅ userId 가져와서 resumeData에 추가
  const userId = localStorage.getItem("userId");
  if (!userId || userId.trim() === "") {
    alert("❌ 로그인 정보가 없습니다. 먼저 로그인해주세요.");
    return;
  }
  resumeData.userId = userId;

  submitButton.disabled = true;
  submitButton.textContent = '질문 생성 중...';
  alert('면접 질문을 생성 중입니다. 잠시만 기다려 주세요.');

  try {
    console.log('✅ 서버로 전송할 데이터:', resumeData);

    const response = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resumeData),
    });

    if (!response.ok) {
      throw new Error(`서버 오류: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ GPT API 응답:', data);

    if (data.error) {
      alert(data.error);
      return;
    }

    const gptQuestions = Array.isArray(data.gptQuestions)
        ? data.gptQuestions
        : [];

    if (gptQuestions.length > 0) {
      localStorage.setItem('gptQuestions', JSON.stringify(gptQuestions));
      alert('면접 질문이 성공적으로 생성되었습니다!');
    } else {
      alert('면접 질문이 5개 미만입니다. 다시 시도해주세요.');
    }
  } catch (error) {
    console.error('❌ GPT API 호출 오류:', error);
    alert('면접 질문 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = '이력서 제출';
  }
}

function displayStoredQuestions() {
  const storedQuestions = localStorage.getItem('gptQuestions');
  if (storedQuestions) {
    const questions = JSON.parse(storedQuestions);
    console.log('✅ 저장된 면접 질문:', questions);
    alert('저장된 질문: \n' + questions.join('\n'));
  } else {
    alert('저장된 면접 질문이 없습니다.');
  }
}

// 버튼 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', function () {
  const submitButton = document.getElementById('submit-button');
  const displayButton = document.getElementById('display-questions-button');

  if (submitButton) {
    submitButton.addEventListener('click', async function (event) {
      event.preventDefault();
      await generateInterviewQuestions();
    });
  }

  if (displayButton) {
    displayButton.addEventListener('click', function () {
      displayStoredQuestions();
    });
  }
});
