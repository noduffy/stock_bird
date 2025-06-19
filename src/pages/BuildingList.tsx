import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { PropertyData } from "../types/property";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const BuildingList = () => {
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    const day = params.get("month"); // 例: "2025-06"
    const year = day?.slice(0, 4);
    const month = day ? parseInt(day.slice(5), 10) : null;

    const raw = localStorage.getItem("propertyData");
    const data: PropertyData[] = raw ? JSON.parse(raw) : [];

    const targetMonth = dayjs(`${day}-01`).startOf("month");

    const filtered = data
        .map((b) => {
        const contract = dayjs(b.契約日).startOf("month");
        const loanEnd = dayjs(b.ローンの期限).startOf("month");
        const depreciationEnd = contract.add(Number(b.法定耐用年数), "year").subtract(1, "month").startOf("month");

        const hasLoanPayment =
            targetMonth.isSameOrAfter(contract, "month") &&
            targetMonth.isSameOrBefore(loanEnd, "month");

        const hasDepreciation =
            targetMonth.isSameOrAfter(contract, "month") &&
            targetMonth.isSameOrBefore(depreciationEnd, "month");

        if (!hasLoanPayment && !hasDepreciation) return null;

        return {
            ...b,
            今月元金: hasLoanPayment ? b.元金 : 0,
            今月減価償却: hasDepreciation ? b.減価償却 : 0,
        };
        })
        .filter((b): b is NonNullable<typeof b> => b !== null); // 型ガードで null を除外
    return (
        <div style={{ padding: "20px" }}>
        <h2>{year}年{month}月のビル一覧</h2>
            <table border={1} cellPadding={8} cellSpacing={0}>
                <thead>
                    <tr>
                        <th>ビル名</th>
                        <th style={{ width: "60px" }}>契約日</th>
                        <th>元金（今月）</th>
                        <th>減価償却（今月）</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map((b, i) => (
                        <tr key={i}>
                            <td>{b.ビル名}</td>
                            <td>{dayjs(b.契約日).format("YYYY-MM")}</td>
                            <td>¥{b.今月元金.toLocaleString()}</td>
                            <td>¥{b.今月減価償却.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default BuildingList;
