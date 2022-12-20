import Task from '../models/task';

export default {
  Query: {
    getTask: async (id: string) => {
      if (!id) throw new Error('id must be provided');
      return await Task.findById(id);
    },
    getTasks: async () => await Task.find(),
  },

  Mutation: {
    createTask: async ({ description, priority }: { description: string; priority?: number }) => {
      try {
        const task = await Task.create({ description, priority });
        console.log(task);
        return task;
      } catch (err: any) {
        throw new Error(err);
      }
    },
    updateTask: async ({
      id,
      description,
      priority,
    }: {
      id: string;
      description: string;
      priority?: number;
    }) => {
      try {
        if (!id) throw new Error('id must be provided');
        const task = await Task.findByIdAndUpdate(id, { description, priority });
        return task;
      } catch (err: any) {
        throw new Error(err);
      }
    },
    deleteTask: async (id: string) => {
      try {
        if (!id) throw new Error('id must be provided');
        return await Task.findByIdAndDelete(id);
      } catch (err: any) {
        throw new Error(err);
      }
    },
  },
};
