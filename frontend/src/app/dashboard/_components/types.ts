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
    total_shipments: number
    delivered_shipments: number
    pending_tasks_count: number
    recent_activity: Activity[]
    kanban_shipments: KanbanShipment[]
}
