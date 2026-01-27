"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from "recharts"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Loader2, PieChart as PieChartIcon } from "lucide-react"

export function AdminAnalytics() {
    const [submissionsData, setSubmissionsData] = useState<any[]>([])
    const [statusData, setStatusData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch specific columns to minimize data transfer
                const { data: investigations, error } = await supabase
                    .from('investigations')
                    .select('created_at, status, views_count')

                if (error) throw error

                if (!investigations) return

                // Process Status Data
                const statusAvailable: Record<string, number> = {}
                const statusConfig: any = {
                    'borrador': 'Borrador',
                    'en_revision': 'En Revisión',
                    'aprobado': 'Aprobado',
                    'rechazado': 'Rechazado'
                }

                investigations.forEach((item) => {
                    const label = statusConfig[item.status] || item.status
                    statusAvailable[label] = (statusAvailable[label] || 0) + 1
                })

                const processedStatusData = Object.keys(statusAvailable).map(key => ({
                    name: key,
                    value: statusAvailable[key],
                    color: getColorForStatus(key)
                }))
                setStatusData(processedStatusData)


                // Process Submissions by Month (Last 6 months)
                const months: Record<string, number> = {}
                // Initialize last 6 months
                for (let i = 5; i >= 0; i--) {
                    const d = new Date()
                    d.setMonth(d.getMonth() - i)
                    const key = d.toLocaleString('es-ES', { month: 'short' })
                    const k = key.charAt(0).toUpperCase() + key.slice(1)
                    months[k] = 0
                }

                investigations.forEach((item) => {
                    const date = new Date(item.created_at)
                    const key = date.toLocaleString('es-ES', { month: 'short' })
                    const k = key.charAt(0).toUpperCase() + key.slice(1)
                    if (months[k] !== undefined) {
                        months[k]++
                    }
                })

                const processedSubmissionsData = Object.keys(months).map(key => ({
                    name: key,
                    total: months[key]
                }))
                setSubmissionsData(processedSubmissionsData)

            } catch (err) {
                console.error("Error fetching analytics:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const getColorForStatus = (status: string) => {
        switch (status.toLowerCase()) {
            case 'aprobado': return '#10b981' // emerald-500
            case 'en revisión': return '#f59e0b' // amber-500
            case 'borrador': return '#64748b' // slate-500
            case 'rechazado': return '#ef4444' // red-500
            default: return '#3b82f6' // blue-500
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 animate-in fade-in duration-500">

            {/* Submissions Trend */}
            <Card className="col-span-4 bg-card/60 backdrop-blur-sm border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle>Tendencia de Envíos</CardTitle>
                    <CardDescription>
                        Nuevas investigaciones en los últimos 6 meses.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={submissionsData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    color: 'hsl(var(--foreground))'
                                }}
                                cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                                labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                            />
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="col-span-3 space-y-4">
                {/* Status Distribution */}
                <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>Estado del Repositorio</CardTitle>
                        <CardDescription>
                            Distribución por estado de aprobación.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                        color: 'hsl(var(--foreground))'
                                    }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    formatter={(value) => <span className="text-muted-foreground">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Quick Tips or Secondary Metric */}
                <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/10 shadow-sm flex flex-col justify-center">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <PieChartIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-bold text-lg">{statusData.find(d => d.name === 'Aprobado')?.value || 0}</p>
                            <p className="text-sm text-muted-foreground font-medium">Investigaciones Aprobadas</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
