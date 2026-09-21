import CallBackView from '@/components/agents/components/agent-call-back-view'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <>
      <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Loading…
          </p>
        </div>
      }
    >
      <CallBackView />
    </Suspense>
    </>
  )
}

export default page