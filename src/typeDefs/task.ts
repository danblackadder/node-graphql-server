import { gql } from 'apollo-server-express';

export default gql`
  type Task {
    id: ID!
    description: String!
    priority: Int
  }
  type Query {
    getTask(id: ID!): Task
    getTasks: [Task]
  }
  type Mutation {
    createTask(description: String!, priority: Int): Task!
    updateTask(description: String!, priority: Int): Task!
    deleteTask(id: ID!): Task!
  }
`;
