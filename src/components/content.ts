import { asset } from '../lib/asset'

export const stripItems = ['Recruitment', 'Remote staffing', 'HR outsourcing', 'Payroll coordination', 'EOR support']

export const servicePillars = [
  {
    id: 'solution-talent',
    image: asset('/images/solution-recruitment.jpg'),
    imageAlt: 'Two professionals shaking hands after a meeting in Nairobi',
    eyebrow: '01 · Talent',
    title: 'Recruitment & talent acquisition',
    description: 'Connect your organization with capable Kenyan professionals.',
    subServices: [{ name: 'Role scoping and search' }, { name: 'Candidate screening' }, { name: 'Hiring coordination' }],
  },
  {
    id: 'solution-workforce',
    image: asset('/images/solution-remote-staffing.jpg'),
    imageAlt: 'Professional smiling on a video call at her desk',
    eyebrow: '02 · Workforce',
    title: 'Remote staffing & managed workforce',
    description: 'Build and coordinate teams that support your day-to-day operations.',
    subServices: [{ name: 'Remote team setup' }, { name: 'Workforce coordination' }, { name: 'Ongoing support' }],
  },
  {
    id: 'solution-people',
    image: asset('/images/solution-hr.jpg'),
    imageAlt: 'Professional working on a laptop at a bright desk',
    eyebrow: '03 · People',
    title: 'Human capital & HR solutions',
    description: 'Improve people operations with hands-on advisory and implementation.',
    subServices: [{ name: 'HR process design' }, { name: 'Policies and documentation' }, { name: 'People advisory' }],
  },
  {
    id: 'solution-operations',
    image: asset('/images/solution-payroll.jpg'),
    imageAlt: 'Professional reviewing charts beside a laptop',
    eyebrow: '04 · Operations',
    title: 'Payroll & workforce technology',
    description: 'Coordinate essential workforce operations with trusted local partners.',
    subServices: [{ name: 'Payroll coordination' }, { name: 'Workforce systems' }, { name: 'Partner-enabled EOR support' }],
  },
]

// Who we serve, each paired with the usual starting point for that audience.
export const audiences = [
  {
    label: 'International organizations',
    title: 'Build a team in Kenya',
    description: 'Entering Kenya or building a distributed team across borders.',
    image: asset('/images/workforce-team-boardroom.jpg'),
    imageAlt: 'Large team working together around a boardroom table',
  },
  {
    label: 'Kenyan businesses',
    title: 'Strengthen HR operations',
    description: 'Scaling operations and strengthening people practices, payroll and compliance.',
    image: asset('/images/workforce-hr-meeting.jpg'),
    imageAlt: 'Colleagues in a business meeting with laptops',
  },
  {
    label: 'Growing teams',
    title: 'Extend your workforce',
    description: 'Hiring first specialists, adding remote talent or professionalizing HR.',
    image: asset('/images/workforce-small-team.jpg'),
    imageAlt: 'Three colleagues working together in a meeting room',
  },
]

export const processSteps = [
  { num: '01', title: 'Discover', description: 'Understand your goals, operating context, and workforce needs.' },
  { num: '02', title: 'Design', description: 'Shape a practical scope, timeline, and delivery approach.' },
  { num: '03', title: 'Deliver', description: 'Coordinate the agreed recruitment and workforce activities.' },
  { num: '04', title: 'Improve', description: 'Review progress and adapt support as your needs evolve.' },
]

export const whyKenya = [
  { n: '01', title: 'A growing talent base', description: 'Kenya offers a diverse, skilled workforce across many professional sectors.' },
  { n: '02', title: 'Strong regional connections', description: 'Nairobi is a major hub for business and innovation in East Africa.' },
  { n: '03', title: 'Local understanding matters', description: 'Experienced local coordination helps teams navigate the operating context.' },
]

export const faqs = [
  { question: 'What services does Avenyra Global provide?', answer: 'We support recruitment, remote staffing, HR operations, payroll coordination, and partner-enabled EOR support.' },
  { question: 'Do you work with organizations outside Kenya?', answer: 'Yes. We work with Kenyan and international organizations seeking to build or support teams in Kenya.' },
  { question: 'How do we get started?', answer: 'Use the enquiry form to describe your workforce needs. We will follow up to understand the requirements and discuss next steps.' },
]

export const CONTACT = {
  phone: '+254 753 590 369',
  email: 'info@avenyraglobal.com',
  location: 'Nairobi, Kenya',
}
