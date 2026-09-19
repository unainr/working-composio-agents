import { ChatView } from '@/components/chat/view/chat-view'
import React from 'react'
interface Props{
   params:Promise<{ id: string }>
}
const ChatPage = async ({ params }:Props) => {
  const { id } = await params
  return (
        <>
      <ChatView id={id} />
    </>
  )
} 

export default ChatPage