// Utility to match GraphQL mutation based on the operation name
export const aliasGraphqlOperations = (req) => {
  req.alias = req.body.operationName
}
