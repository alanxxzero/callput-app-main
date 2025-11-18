import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { redis } from './redis';

const client = new ApiGatewayManagementApiClient({
  region: "ap-northeast-2",
  apiVersion: "2018-11-29",
  endpoint: "https://emcy79iz6k.execute-api.ap-northeast-2.amazonaws.com/prod/",
});

export const sendData = async (connectionId: string, data: any) => {
  const input = {
    ConnectionId: connectionId,
    Data: data
  };

  const command = new PostToConnectionCommand(input);

  try {
    const response = await client.send(command);
    return response;
  } catch (error) {
    console.error('Failed to send message to connection:', connectionId, error);

    if ((error as any).$metadata.httpStatusCode === 410) {
      await redis.srem('connections', connectionId);
      console.log(`Cleaned up stale connection: ${connectionId}`);
    }
  }
}

export const sendDataToAll = async (data: any) => {
  const connections = await redis.smembers('connections');

  return await Promise.all(connections.map(async (connectionId) => {
    return await sendData(connectionId, data);
  }));
}