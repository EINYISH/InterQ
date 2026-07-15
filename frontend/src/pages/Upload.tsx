import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const emptyForm = {
  name: '',
  birthday: '',
  contactInformation: '',
  educationLevel: '',
  major: '',
  university: '',
  graduationDate: '',
  workExperience: '',
  jobRoles: '',
  projects: '',
  technicalSkills: '',
  certifications: '',
  languageProficiency: '',
  desiredField: '',
  desiredPosition: '',
  careerGoals: '',
  selfIntroduction: '',
}

type FormState = typeof emptyForm

function TextField({
  label,
  field,
  form,
  onChange,
}: {
  label: string
  field: keyof FormState
  form: FormState
  onChange: (field: keyof FormState, value: string) => void
}) {
  return (
    <div>
      <label className="block text-xs text-[#8A9BBF] mb-1.5">{label}</label>
      <input
        value={form[field]}
        onChange={(e) => onChange(field, e.target.value)}
        className="w-full bg-[#0F1628] border border-[#1E2A4A] rounded-lg px-4 py-2.5 text-sm text-[#E8EEFF] focus:outline-none focus:border-[#4A7CFF] focus:ring-1 focus:ring-[#4A7CFF]/30 transition-all"
      />
    </div>
  )
}

function TextAreaField({
  label,
  field,
  form,
  onChange,
  placeholder,
}: {
  label: string
  field: keyof FormState
  form: FormState
  onChange: (field: keyof FormState, value: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs text-[#8A9BBF] mb-1.5">{label}</label>
      <textarea
        value={form[field]}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-[#0F1628] border border-[#1E2A4A] rounded-lg px-4 py-2.5 text-sm text-[#E8EEFF] resize-none focus:outline-none focus:border-[#4A7CFF] focus:ring-1 focus:ring-[#4A7CFF]/30 placeholder:text-[#4A5880] transition-all"
      />
    </div>
  )
}

export default function Upload() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const canSubmit = form.name && form.jobRoles && form.selfIntroduction

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/generate-questions', form)
      const questions: string[] = res.data.gptQuestions ?? []

      if (questions.length === 0) {
        setError('질문 생성에 실패했습니다. 입력 내용을 조금 더 채워주세요.')
        return
      }

      navigate('/simulation', { state: { questions } })
    } catch {
      setError('질문 생성 중 오류가 발생했습니다. Ollama 서버가 켜져 있는지 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#1E2A4A]">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#8A9BBF] hover:text-[#E8EEFF] transition-colors text-sm"
        >
          ← 돌아가기
        </button>
        <span className="text-xs font-mono text-[#4A5880]">이력서 입력</span>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <h1 className="text-3xl font-bold text-[#E8EEFF] mb-2 tracking-tight">이력서를 입력하세요</h1>
        <p className="text-[#8A9BBF] text-sm mb-10">
          입력한 내용을 바탕으로 AI가 맞춤 면접 질문을 만들어드려요.
        </p>

        <section className="mb-10">
          <label className="block text-xs font-mono text-[#4A7CFF] uppercase tracking-widest mb-4">
            01 — 기본 정보
          </label>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="이름" field="name" form={form} onChange={update} />
            <TextField label="생년월일" field="birthday" form={form} onChange={update} />
            <TextField label="연락처" field="contactInformation" form={form} onChange={update} />
            <TextField label="최종 학력" field="educationLevel" form={form} onChange={update} />
            <TextField label="전공" field="major" form={form} onChange={update} />
            <TextField label="학교" field="university" form={form} onChange={update} />
            <TextField label="졸업 연도" field="graduationDate" form={form} onChange={update} />
          </div>
        </section>

        <section className="mb-10">
          <label className="block text-xs font-mono text-[#4A7CFF] uppercase tracking-widest mb-4">
            02 — 경력 · 기술
          </label>
          <div className="space-y-4">
            <TextAreaField label="경력 사항" field="workExperience" form={form} onChange={update} />
            <TextAreaField label="직무 역할" field="jobRoles" form={form} onChange={update} placeholder="지원하는 직무에서 맡았거나 맡고 싶은 역할" />
            <TextAreaField label="프로젝트 경험" field="projects" form={form} onChange={update} />
            <div className="grid grid-cols-2 gap-4">
              <TextField label="기술 스택" field="technicalSkills" form={form} onChange={update} />
              <TextField label="자격증" field="certifications" form={form} onChange={update} />
              <TextField label="외국어 능력" field="languageProficiency" form={form} onChange={update} />
            </div>
          </div>
        </section>

        <section className="mb-12">
          <label className="block text-xs font-mono text-[#4A7CFF] uppercase tracking-widest mb-4">
            03 — 목표 · 자기소개
          </label>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <TextField label="지원 분야" field="desiredField" form={form} onChange={update} />
              <TextField label="희망 직무" field="desiredPosition" form={form} onChange={update} />
            </div>
            <TextAreaField label="향후 경력 목표" field="careerGoals" form={form} onChange={update} />
            <TextAreaField
              label="자기소개"
              field="selfIntroduction"
              form={form}
              onChange={update}
              placeholder="본인의 강점과 경험을 자유롭게 적어주세요."
            />
          </div>
        </section>

        {error && <p className="text-sm text-[#FF4D6A] mb-4">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className={`w-full py-4 rounded-lg font-semibold text-base transition-all ${
            canSubmit && !loading
              ? 'bg-[#4A7CFF] text-white hover:bg-[#5A8CFF] hover:shadow-[0_0_32px_rgba(74,124,255,0.25)] active:scale-[0.99]'
              : 'bg-[#0F1628] text-[#4A5880] border border-[#1E2A4A] cursor-not-allowed'
          }`}
        >
          {loading ? 'AI가 질문을 만들고 있어요...' : canSubmit ? '질문 생성하기 →' : '이름·직무·자기소개는 필수예요'}
        </button>
      </form>
    </div>
  )
}
