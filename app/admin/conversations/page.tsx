import {
  getAllConversations,
  getConversationMessages,
} from "@/lib/conversations";
import { AdminConversationsClient } from "@/components/admin/AdminConversationsClient";

export default async function AdminConversationsPage() {
  const conversations = await getAllConversations();
  const firstId = conversations[0]?.id as string | undefined;
  const messages = firstId
    ? await getConversationMessages(firstId)
    : [];

  return (
    <>
      <h1>Conversas (auditoria IA)</h1>
      <AdminConversationsClient
        conversations={conversations}
        initialConversationId={firstId ?? null}
        initialMessages={messages}
      />
    </>
  );
}
