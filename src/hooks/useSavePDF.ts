// src/hooks/useSavePDF.ts (リネーム＆全コード)

import { useState } from "react";

/**
 * PDF保存のロジックを管理するフック
 */
export const useSavePDF = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runAction = async (action: () => Promise<void>) => {
        setIsLoading(true);
        setError(null);
        try {
            await action();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "操作に失敗しました。");
        } finally {
            setIsLoading(false);
        }
    };

    // 印刷 (★ 削除)
    // const onPrint = () => ...

    // PDF保存
    const onSavePDF = () => {
        runAction(window.electronAPI.handleSavePDF);
    };

    return {
        isLoading,
        error,
        onSavePDF, // onPrint を削除
    };
};