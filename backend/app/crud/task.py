from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.task import Task
from typing import List

class CRUDTask:
    async def get_multi_by_user(self, db: AsyncSession, user_id: str) -> List[Task]:
        result = await db.execute(
            select(Task)
            .filter(Task.user_id == user_id)
            .filter(Task.status != "ARCHIVED")
            .order_by(Task.created_at.desc())
        )
        return result.scalars().all()

    async def create(self, db: AsyncSession, obj_in: dict, user_id: str) -> Task:
        db_obj = Task(**obj_in, user_id=user_id)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def toggle_status(self, db: AsyncSession, task_id: str, user_id: str) -> Task | None:
        result = await db.execute(select(Task).filter(Task.id == task_id, Task.user_id == user_id))
        task = result.scalars().first()
        if task:
            if task.status == "PENDING":
                task.status = "COMPLETED"
            else:
                task.status = "PENDING"
            await db.commit()
            await db.refresh(task)
        return task

task = CRUDTask()
