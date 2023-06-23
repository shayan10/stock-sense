import { ExpressionBuilder } from "kysely";
import { db } from "../../db/Postgres";
import {jsonArrayFrom} from 'kysely/helpers/postgres';
import { DB } from "kysely-codegen";
import { taskPayload, taskUpdatePayload } from "./TaskSchema";
import { subtaskUpdatePayload } from "./SubTaskSchema";

export class TaskRepo {
    
    private getSubTasks() {
        return (eb: ExpressionBuilder<DB, "tasks">) => {
            return jsonArrayFrom(
                eb.selectFrom("subtasks")
                .select(["subtasks.id", 'subtasks.content', "subtasks.completed"])
                .whereRef("subtasks.task_id", '=', "tasks.id")
                .orderBy("subtasks.completed")
            ).as("subtasks")
        }
    }
    
    async find(id: number, user_id: number) {
        const task = db.selectFrom("tasks").where("id", "=", id)
            .where("user_id", '=', user_id).innerJoin("folders",
                "tasks.folder_id", "folders.id")
            .select([
                "id", "content", "deadline", "completed", "folders.name as folder"
            ])
            .select(this.getSubTasks()) 
            .executeTakeFirst();

        return task;
    }

    async findMany(user_id: number) {
        const tasks = db.selectFrom("tasks")
            .where("user_id", '=', user_id).innerJoin("folders",
                "tasks.folder_id", "folders.id")
            .select([
                "id", "content", "deadline", "completed", "folders.name as folder"
            ])
            .select(this.getSubTasks())
            .execute();

        return tasks;
    }

    async create(user_id: number, {content, completed, deadline, folder_id, subtasks}: taskPayload) {
        return await db.transaction().execute(async (trx) => {
            const savedTask = await trx.insertInto("tasks").values({
                user_id,
                content,
                completed,
                deadline,
                folder_id
            }).returningAll().executeTakeFirstOrThrow(() => new Error("Could not insert tasks"));

            // Insert into db
            const savedSubtasks = await trx.insertInto("subtasks")
                .values(subtasks.map((value)=> ({
                    ...value,
                    user_id,
                    "task_id": savedTask.id
                }))).returningAll().execute();

            return {
                ...savedTask,
                "subtasks": savedSubtasks
            }
        })
    }

    async updateTask(user_id: number, task_id: number, task: taskUpdatePayload) {
        return await db.transaction().execute(async (trx) => {
            // Update task
            const updatedTask = await trx.updateTable("tasks").set(task).where("tasks.id", "=", task_id)
                .where("user_id", "=", user_id).returningAll().executeTakeFirst();

            return updatedTask;
        })
    };

    async updateSubtask(user_id: number, subtask_id: number, subtask: subtaskUpdatePayload) {
        return await db.transaction().execute(async (trx)=> {
            // Update subtask record
            const updatedSubtask = await trx.updateTable("subtasks").set(subtask).where("user_id", "=", user_id)
                .where("id", "=", subtask_id).returningAll().executeTakeFirst();

            return updatedSubtask;
        })
    }

    async deleteTask(user_id: number, task_id: number) {
        return await db.transaction().execute(async (trx)=> {
            const deletedTask = trx.deleteFrom("tasks").where("tasks.id", "=", task_id)
                .where("user_id", "=", user_id).returning("id").executeTakeFirst();
            return deletedTask;
        });
    }

}