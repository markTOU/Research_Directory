import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Shell from '@/components/Shell'
import Directory from '@/pages/Directory'
import ImportPage from '@/pages/ImportPage'
import Insights from '@/pages/Insights'
import ResearcherDetail from '@/pages/ResearcherDetail'

export default function App() {
  return (
    <Router>
      <Shell>
        <Routes>
          <Route path="/" element={<Directory />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/researcher/:id" element={<ResearcherDetail />} />
        </Routes>
      </Shell>
    </Router>
  )
}
