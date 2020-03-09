
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'


// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const cert = `-----BEGIN CERTIFICATE-----
MIIDETCCAfmgAwIBAgIJP1IV2MCe61mzMA0GCSqGSIb3DQEBCwUAMCYxJDAiBgNV
BAMTG21vbmV5LW1vdW50YWluLmV1LmF1dGgwLmNvbTAeFw0yMDAyMjgwOTUyMDla
Fw0zMzExMDYwOTUyMDlaMCYxJDAiBgNVBAMTG21vbmV5LW1vdW50YWluLmV1LmF1
dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL9SEYK1IGHF
8ynEoaY4AUivVFqHWeVxzOzTPKlmKJ/z0VMSTCzm/IJIYIr0G6MdwsVFYVBp7RpR
eXp4U92wWHHPYyrNPkbhwEduPxOPU/S3l3it6pgMnVfBGutzQ+krWw55Mmv6DU4H
judppkZSCFA7GBIaTm5adsqywmdzyZec6Cc/mS1QV+J9A+y6fQO8ojEG+CuEguaM
4DCYL+OCUITLk8uaXQlkLBDBbDG9UCOCzZc1fNhc5ub11PdC/Xo2/LkhA1IAc1wW
0iX5VqEOJQgzAX+moH0HeqLekSE9AKUU9L7L72+62ZXxXK3YK/I56i6jWsofUyj5
a61CLTHTsCUCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUe2t9
Ge8Y2JSzVevUoJyOvDFg/lwwDgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUA
A4IBAQBVFhuT6Zc6Xm5tCO5mvuFAjgu7j9aHLgPahhCJjl9OJSzzbBKTUE6/U1LZ
quILC2HZ+hBNfa2sziM6Bm6MJ6lf0NJbXOSi11t6ymYya7LkLDzz3xBngRzXi/Ts
PPFBJyXyNAeJdTHmsjzmV4o608LgaJYQPrxLxWBBYHZgc2ZLQKRAK7exWcbuyBL1
9IGb9VwyuVayJP5wBQfI1XJ2kokpIMTBINHoVhwIv59NKZ5yENugoKgB5rEOZSjK
F/Y5nBm7HHmwFpdjbns0chC6oGtTjkQDcgFuyERvn+ctzWH28HcXzP86y5WQ790A
nSNPbOn1NfcvC9K4P2x+FlG2sWlW
-----END CERTIFICATE-----`

export const handler = async (  event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  console.log('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}
