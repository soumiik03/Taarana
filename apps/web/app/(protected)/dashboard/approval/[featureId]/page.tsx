import { ApprovalView } from "~/features/approval/components/approval-view";

export default async function ApprovalPage({
    params,
}: {
    params: Promise<{ featureId: string }>;
}) {
    const { featureId } = await params;
    return <ApprovalView featureId={featureId} />;
}
