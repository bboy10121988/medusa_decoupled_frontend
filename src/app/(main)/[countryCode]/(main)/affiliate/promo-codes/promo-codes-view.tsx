"use client";

import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";

interface PromoCode {
    id: string;
    code: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    commission_rate: number;
    status: string;
    used: number;
    limit: number | null;
    total_conversions: number;
    total_earnings: number;
    confirmed_earnings: number;
    ends_at: string | null;
}

export default function PromoCodesView({ countryCode }: { countryCode: string }) {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const fetchPromoCodes = async () => {
        try {
            const res = await fetch("/api/store/affiliates/promo-codes", {
                headers: {
                    "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
                },
                credentials: "include",
            });
            const data = await res.json();
            setPromoCodes(data.promo_codes || []);
        } catch (error) {
            console.error("Failed to fetch promo codes:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (code: string) => {
        await navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("zh-TW", {
            style: "currency",
            currency: "TWD",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDiscount = (type: string, value: number) => {
        if (type === "percentage") {
            return `${value}% 折扣`;
        }
        return `折 ${formatCurrency(value)}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">我的分潤折扣碼</h1>

            {promoCodes.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">目前沒有分潤折扣碼</p>
                    <p className="text-sm text-gray-400 mt-2">
                        請聯繫管理員為您建立專屬折扣碼
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {promoCodes.map((promo) => (
                        <div
                            key={promo.id}
                            className="border rounded-lg p-6 bg-white shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-mono font-bold text-blue-600">
                                        {promo.code}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(promo.code)}
                                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                        title="複製折扣碼"
                                    >
                                        {copiedCode === promo.code ? (
                                            <Check className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Copy className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    {promo.ends_at && (
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm ${
                                                new Date(promo.ends_at) < new Date()
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-blue-100 text-blue-700"
                                            }`}
                                        >
                                            {new Date(promo.ends_at) < new Date()
                                                ? "已過期"
                                                : `期限至 ${new Date(promo.ends_at).toLocaleDateString("zh-TW")}`}
                                        </span>
                                    )}
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm ${promo.status === "active"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {promo.status === "active" ? "啟用中" : "已停用"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">顧客折扣</p>
                                    <p className="font-semibold">
                                        {formatDiscount(promo.discount_type, promo.discount_value)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">您的佣金比例</p>
                                    <p className="font-semibold">
                                        {(promo.commission_rate * 100).toFixed(0)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">轉換訂單</p>
                                    <p className="font-semibold">{promo.total_conversions} 筆</p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">累計佣金</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {formatCurrency(promo.total_earnings)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">已確認佣金</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {formatCurrency(promo.confirmed_earnings)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">如何使用折扣碼？</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>將您的折扣碼分享給朋友或粉絲</li>
                    <li>顧客在結帳時輸入折扣碼即可享受折扣</li>
                    <li>訂單完成付款後，您將獲得對應的佣金</li>
                    <li>佣金將在每月結算後發放</li>
                </ol>
            </div>
        </div>
    );
}
