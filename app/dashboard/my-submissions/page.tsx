import { Suspense } from "react"
import { SubmissionsContent } from "@/components/submissions/submissions-content"

export default function MySubmissionsPage() {
  return (
    <Suspense fallback={null}>
      <SubmissionsContent />
    </Suspense>
  )
}
