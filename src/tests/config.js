import { ApolloServer } from '@apollo/server';
import mongoose from 'mongoose';

import typeDefs from '../typeDefs';
import resolvers from '../resolvers';

mongoose.promise = global.Promise;

async function cleanAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany();
  }
}

async function dropAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    try {
      await mongoose.connection.db.dropCollection(collectionName);
    } catch (error) {
      throw new Error(error);
    }
  }
}

export const database = (databaseName) => {
  beforeAll(async () => {
    const url = `mongodb://127.0.0.1/${databaseName}`;
    mongoose.set('strictQuery', false);
    await mongoose.connect(url);
  });

  afterEach(async () => {
    await cleanAllCollections();
  });

  afterAll(async () => {
    await dropAllCollections();
    await mongoose.connection.close();
  });
};

export const server = new ApolloServer({
  typeDefs,
  resolvers,
});
