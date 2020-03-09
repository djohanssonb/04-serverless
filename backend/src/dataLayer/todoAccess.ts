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
    const result = await this.docClient.query({
      TableName: this.todoTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async getTodo(todoId: String, userId: String): Promise<TodoItem> {
    const params = {
      TableName: this.todoTable,
      KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
      ExpressionAttributeValues: {
          ':todoId': todoId,
          ':userId': userId,
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

  async updateTodoRequest(todoId: String, userId: String, name: String, dueDate: String, done: Boolean): Promise<TodoItem> {
    var params = {
      TableName: this.todoTable,
      Key:{
          "userId": userId,
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
    console.log(result);
    const updatedAttr = result.Attributes;
    return updatedAttr as TodoItem;
  }
  
  async updateAttachment(todoId: string, attachmentUrl: string): Promise<Boolean>
  {
    console.log("Updating item with attachment url: " + attachmentUrl)
    var params = {
      TableName: this.todoTable,
      Key:{
          "todoId": todoId
      },
      UpdateExpression: "set attachmentUrl=:att",
      ExpressionAttributeValues:{
          ":att": attachmentUrl
      },
      ReturnValues:"ALL_NEW"
    };
    console.log("update complete")
    this.docClient.update(params, function(err, data) {
      if (err) {
        console.log("update error")
          return false
      } else if (data){
        console.log("update complete")
          return true
      }
    })
    return false
  }

  async deleteTodo(todoId: String): Promise<Boolean> {
    var removed=false
    var params = {
        TableName: this.todoTable,
        Key:{
          "todoId": todoId
        }
    };
    console.log("Trying to delete todo item" + todoId);
    try
    {
      this.docClient.delete(params, function(err, data) {
        if (err) {
            console.log("Unable to delete item. Error JSON:"+err.stack);
        } else {
            console.log("DeleteItem succeeded:" + JSON.stringify(data));
            removed = true
        }
      });
    }
    catch(e)
    {
      console.log("Unable to delete due to exception: "+e.getMessage())
    }
    return removed
  }
}
