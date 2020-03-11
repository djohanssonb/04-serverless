import * as uuid from 'uuid'
//import * as AWS  from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { getUserId } from '../auth/utils'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

//const XAWS = AWSXRay.captureAWS(AWS)
//const docClient = new XAWS.DynamoDB.DocumentClient()

const todoAccess = new TodoAccess()

export async function getAllTodo(jwtToken: string): Promise<TodoItem[]> {
  return todoAccess.getAllTodo(getUserId(jwtToken))
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {
  console.log("Executing CreateTodo")
  const todoId = uuid.v4()
  const userId = getUserId(jwtToken)
  return await todoAccess.createTodoRequest({
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    attachmentUrl: "none"
  })
}

export async function getTodo(
  todoId: string
): Promise<TodoItem> {
  return todoAccess.getTodo(todoId)
}

export async function deleteTodo(
  todoId: string
): Promise<Boolean> {
  return todoAccess.deleteTodo(todoId)
}

export async function updateTodo(
    todoUpdateRequest: UpdateTodoRequest,
    todoId: string
): Promise<TodoItem> {
    return todoAccess.updateTodoRequest(todoId, 
      todoUpdateRequest.name, 
      todoUpdateRequest.dueDate,
      Boolean(todoUpdateRequest.done))
}

export async function updateAttachment(
  imagePath: string, todoId: string
):Promise<string> {
  console.log("Updating attachment TodoID: "+todoId +" URL: "+imagePath)
  return todoAccess.updateAttachment(todoId, imagePath)
}
