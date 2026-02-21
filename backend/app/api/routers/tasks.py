from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api import deps
from app.models.user import User
from app import crud
from app.schemas import TaskSchema, TaskCreate
from app.services.activity import activity_service
from typing import List

router = APIRouter()

@router.get("/me", response_model=List[TaskSchema])
async def get_my_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Retrieve all pending and completed tasks for the current user.
    """
    return await crud.task.get_multi_by_user(db, user_id=str(current_user.id))

@router.post("/{task_id}/toggle", response_model=TaskSchema)
async def toggle_task_status(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Toggle a task status between PENDING and COMPLETED.
    """
    task = await crud.task.toggle_status(db, task_id=task_id, user_id=str(current_user.id))
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or access denied")
    
    # AUDIT PILLAR: Log Task Interaction
    action = "TASK_COMPLETED" if task.status == "COMPLETED" else "TASK_REOPENED"
    await activity_service.log(
        db,
        user_id=str(current_user.id),
        action=action,
        entity_type="TASK",
        entity_id=str(task.id),
        metadata={"title": task.title}
    )
    
    return task

@router.post("/", response_model=TaskSchema)
async def create_task(
    task_in: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Manually create a task (primarily used for system-generated tasks in reality).
    """
    task = await crud.task.create(db, obj_in=task_in.dict(), user_id=str(current_user.id))
    
    # AUDIT PILLAR: Log Task Creation
    await activity_service.log(
        db,
        user_id=str(current_user.id),
        action="TASK_CREATED",
        entity_type="TASK",
        entity_id=str(task.id),
        metadata={"title": task.title}
    )
    
    return task
