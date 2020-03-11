import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)
import { TodoItem } from '../models/TodoItem'
export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todoTable = process.env.TODO_TABLE) {
  }
  async getAllTodo(userId: String): Promise<TodoItem[]> {
          console.log('Getting all Todo items')
          var params = {
            TableName: this.todoTable,
         //   ProjectionExpression: "#u",
            FilterExpression: "#u = :userId",
            ExpressionAttributeNames: {
                "#u": "userId",
            },
            ExpressionAttributeValues: {
                 ":userId": userId
            }
        };
        
        console.log("Scanning todo table");
        const result = await this.docClient.scan(params).promise();
    
        return result.Items as TodoItem[]
  }
  async getTodo(todoId: String): Promise<TodoItem> {
    const params = {
      TableName: this.todoTable,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
          ':todoId': todoId
      },
      ScanIndexForward: false
    };
    const result = await this.docClient.query(params).promise();
    const items = result.Items;
    return items[0] as TodoItem;
  }

  async createTodoRequest(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todo
    }).promise()
    return todo
  }

  async updateTodoRequest(todoId: String, name: String, dueDate: String, done: Boolean): Promise<TodoItem> {
    var params = {
      TableName: this.todoTable,
      Key:{
          "todoId": todoId
      },
      UpdateExpression: "set #a = :a, #b = :b, #c = :c",
      ExpressionAttributeNames: {
          "#a": "name",
          "#b": "dueDate",
          "#c": "done"
      },
      ExpressionAttributeValues: {
          ":a": name,
          ":b": dueDate,
          ":c": done
      },
      ReturnValues:"ALL_NEW"
    };
    console.log("Updating the item...");
    const result = await this.docClient.update(params).promise();
    console.log("Item updated: "+JSON.stringify(result.Attributes));
    const updatedAttr = result.Attributes;
    return updatedAttr as TodoItem;
  }
  
  async updateAttachment(todoId: string, imagePath: string): Promise<string>
  {
    console.log("Updating item with attachment url: " + imagePath)
    const result = await this.docClient.update({
      TableName: this.todoTable,
      Key:{
        "todoId": todoId
        },
        UpdateExpression: "set attachmentUrl = :value",
        ExpressionAttributeValues:{
          ":value": imagePath
        },
        ReturnValues:"ALL_NEW"
      }).promise();

      console.log("Item updated: " + JSON.stringify(result.Attributes))
     
      return "updated" as string
  }

  async deleteTodo(todoId: string): Promise<Boolean> {
      await this.docClient.delete({
      TableName: this.todoTable,
      Key:{
        "todoId": todoId
      },
        ConditionExpression:"todoId= :val",
        ExpressionAttributeValues: {
          ":val": todoId
      }
    }).promise()
    return true
  }
}
