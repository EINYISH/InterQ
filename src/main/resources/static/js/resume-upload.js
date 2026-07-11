document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#resumeForm"); // ✅ form id 확인 필요

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const getValue = (id) => document.getElementById(id)?.value || "";
        const userId = localStorage.getItem("userId");

        if (!userId || userId.trim() === "") {
            alert("❌ 로그인 정보가 없습니다. 먼저 로그인해주세요.");
            return;
        }

        const data = {
            userId: userId,
            name: getValue("name"),
            birthday: getValue("birthday"),
            contactInformation: getValue("contact-information"),
            educationLevel: getValue("education-level"),
            major: getValue("major"),
            university: getValue("university"),
            graduationDate: getValue("graduation-date"),
            workExperience: getValue("work-experience"),
            jobRoles: getValue("job-roles"),
            projects: getValue("projects"),
            certifications: getValue("certifications"),
            languageProficiency: getValue("language-proficiency"),
            technicalSkills: getValue("technical-skills"),
            desiredField: getValue("desired-field"),
            desiredPosition: getValue("desired-position"),
            careerGoals: getValue("career-goals"),
            selfIntroduction: getValue("self-introduction"),
            gptResponse: "GPT 분석 전입니다."
        };

        try {
            const response = await fetch("http://localhost:8080/api/resumes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                alert("저장 완료! ID: " + result.id);
                window.location.href = "/notice";
            } else {
                alert("저장 실패: " + response.status);
            }
        } catch (err) {
            console.error("에러 발생", err);
            alert("저장 중 오류 발생");
        }
    });
});