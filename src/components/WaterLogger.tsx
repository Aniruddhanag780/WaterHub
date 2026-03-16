"use client"

import { useHydration } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Coffee, GlassWater, Refrigerator, Zap } from "lucide-react"
import { useState } from "react"

const PRESETS = [
  { label: "150ml", amount: 150, icon: Coffee },
  { label: "250ml", amount: 250, icon: GlassWater },
  { label: "500ml", amount: 500, icon: Refrigerator },
]

export function WaterLogger() {
  const { addLog } = useHydration()
  const [customAmount, setCustomAmount] = useState("")

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount)
    if (!isNaN(amount) && amount > 0) {
      addLog(amount)
      setCustomAmount("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {PRESETS.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            className="flex flex-col h-auto py-4 hover:border-primary hover:text-primary transition-all bg-card"
            onClick={() => addLog(preset.amount)}
          >
            <preset.icon className="w-6 h-6 mb-2" />
            <span className="font-semibold">{preset.label}</span>
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="number"
            placeholder="Custom amount (ml)..."
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="pl-10"
          />
          <Zap className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
        <Button onClick={handleCustomAdd} disabled={!customAmount} className="bg-accent hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-2" /> Add
        </Button>
      </div>
    </div>
  )
}