notes:

-    Modified the `/plaid/initialize` endpoint to be a socket.io endpoint which returns an acknowledgement of the users request. This was done since the request took > 700ms and instead switched to a websocket/message queue approach, where the connection is made using websockets and the task is given to the message queue to fetch and parse data from Plaid, the event is then emitted, and then we can send a message to the client
-    Included the interfaces in the Repository to define the responses. This was a better approach then simply defining Zod schemas and helped decouple input validation from the response format from the DB
-    Denormalized the holdings database to include the plaid_account_id since this field would be used to quickly retrieve all the holdings with the corresponding account_id instead of doing a join with the accounts table and filtering the records every time an update was sent from Plaid
