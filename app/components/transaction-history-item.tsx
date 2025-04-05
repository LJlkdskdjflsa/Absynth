"use client"

import { ArrowDownToLine, ArrowUpFromLine, Heart } from "lucide-react"

interface TransactionHistoryItemProps {
    type: string
    amount: number
    source: string
    destination: string
    date: string
    time: string
}


export default function TransactionHistoryItem({ type, amount, source, destination, date, time }: TransactionHistoryItemProps) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
                <div
                    className={`rounded-full p-2 ${type === "deposit" ? "bg-green-100" : type === "withdrawal" ? "bg-orange-100" : "bg-blue-100"
                        }`}
                >
                    {type === "deposit" && <ArrowDownToLine className={`h-4 w-4 text-green-600`} />}
                    {type === "withdrawal" && <ArrowUpFromLine className={`h-4 w-4 text-orange-600`} />}
                    {type === "donation" && <Heart className={`h-4 w-4 text-blue-600`} />}
                </div>
                <div>
                    <div className="font-medium capitalize">{type}</div>
                    <div className="text-xs text-muted-foreground">
                        {type === "deposit" ? `From: ${source}` : `To: ${destination}`}
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className={`font-medium ${type === "deposit" ? "text-green-600" : "text-red-600"}`}>
                    {type === "deposit" ? "+" : "-"}
                    {amount} USDC
                </div>
                <div className="text-xs text-muted-foreground">
                    {date} at {time}
                </div>
            </div>
        </div>
    )
}

