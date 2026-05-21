export type FollowStatus = 'todo' | 'contacted' | 'replied' | 'closed'

export type Researcher = {
  id: string
  name: string
  name_zh: string | null
  continent: string | null
  country_or_region: string | null
  institution: string | null
  research_area: string | null
  homepage_url: string | null
  recruiting_url: string | null
  email: string | null
  phone: string | null
  wechat: string | null
  notes: string | null
  group_name: string | null
  follow_status: FollowStatus | null
  created_at: string
  updated_at: string
}

export type Tag = {
  id: string
  name: string
  color: string | null
  created_at: string
}

