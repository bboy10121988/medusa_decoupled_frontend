import { Metadata } from "next";
// @ts-ignore
import { retrieveAffiliate } from "@lib/data/affiliate-auth";
import { redirect } from "next/navigation";
import PromoCodesView from "./promo-codes-view";

export const metadata: Metadata = {
    title: "我的分潤折扣碼 | 聯盟會員中心",
};

export default async function PromoCodesPage({
    params,
}: {
    params: Promise<{ countryCode: string }>;
}) {
    const { countryCode } = await params;
    const session = await retrieveAffiliate();

    if (!session) {
        redirect(`/${countryCode}/affiliate/login`);
    }

    return <PromoCodesView countryCode={countryCode} />;
}
