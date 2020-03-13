import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
//import * as AWS  from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { getAllTodo } from '../../businessLogic/todo'
//const XAWS = AWSXRay.captureAWS(AWS)

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];
  const todoItems = await getAllTodo(jwtToken);

  return {
      statusCode: 200,
      headers: {
          "Access-Control-Allow-Origin": "*",
          'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
          "items": todoItems,
      })
  }
}
