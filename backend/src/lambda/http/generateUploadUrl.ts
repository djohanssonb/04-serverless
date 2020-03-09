import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'
import * as AWSXRay from 'aws-xray-sdk'
import { updateAttachment } from '../../businessLogic/todo'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

//const todoTable = process.env.TODO_TABLE
const bucketName = process.env.ATTACHMENTS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  console.log(todoId)
  const imageId = uuid.v4()
  const url = getUploadUrl(imageId)
  const bUpdated = updateAttachment(url, todoId)
  if(bUpdated)
  {
    return {
      statusCode: 200,
      headers: {
          "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
          uploadUrl: url
      })
    }
  }
  else
  {
    return {
      statusCode: 500,
      headers: {
          "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
          error: 'Unable to update attachment url!'
      })
  }
  }

  function getUploadUrl(imageId: string) {
    return s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: imageId,
      Expires: urlExpiration
    })
  }
}