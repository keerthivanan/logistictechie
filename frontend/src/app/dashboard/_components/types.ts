export interface ChartPoint {
    label: string
    value: number
}

export interface Activity {
    id: string
    action: string
    entity: string
    timestamp: string
    metadata: any
    url: string
}

export interface KanbanShipment {
    id: string
    company: string
    desc: string
    date: string
    comments: number
    views: number
    status: string
    mode: string
    highlight?: boolean
}

export interface DashboardStats {
    active_shipments: number
    containers: number
    on_time_rate: string
    pending_tasks_count: number
    chart_data: ChartPoint[]
    recent_activity: Activity[]
    kanban_shipments: KanbanShipment[]
}
